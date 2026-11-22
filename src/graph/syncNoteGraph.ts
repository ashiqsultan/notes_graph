import type { Note } from "@/db";
import { buildMergeCypher } from "@/graph/buildMergeCypher";
import { deleteNoteGraph } from "@/graph/deleteNoteGraph";
import { extractNoteGraph } from "@/graph/extractNoteGraph";
import {
  showExtractingToast,
  showExtractionError,
  showGraphError,
  showGraphSaved,
  showModelUnavailable,
  showRemovalError,
  showUnexpectedError,
} from "@/graph/graphSyncToasts";
import { runCypher } from "@/graph/relateClient";
import { isWebGpuAvailable } from "@/lib/llm";
import { getNote } from "@/lib/notes";

let syncChain: Promise<void> = Promise.resolve();
const waitingNoteIds = new Set<number>();

interface SyncJob {
  noteId: number;
  title: string;
  toastId: string;
}

/**
 * Queues a graph update for a note. Syncs run one after another, and a note
 * that is already waiting is not queued twice because the latest saved text is
 * read when its turn comes. A deleted note is simply removed from the graph.
 */
export function queueNoteGraphSync(noteId: number): Promise<void> {
  if (waitingNoteIds.has(noteId)) return syncChain;

  waitingNoteIds.add(noteId);
  syncChain = syncChain.then(() => {
    waitingNoteIds.delete(noteId);
    return syncNoteGraph(noteId).catch(showUnexpectedError);
  });
  return syncChain;
}

async function syncNoteGraph(noteId: number): Promise<void> {
  const note = await getNote(noteId);
  const noteText = note ? toNoteText(note) : "";
  if (!note || !noteText) return removeNoteFromGraph(noteId);

  return rebuildNoteGraph(noteId, displayTitle(note.title), noteText);
}

async function removeNoteFromGraph(noteId: number): Promise<void> {
  try {
    await deleteNoteGraph(noteId);
  } catch (error) {
    showRemovalError(error);
  }
}

async function rebuildNoteGraph(noteId: number, title: string, noteText: string): Promise<void> {
  if (!isWebGpuAvailable()) {
    showModelUnavailable(title);
    return;
  }

  const job: SyncJob = { noteId, title, toastId: showExtractingToast(title) };
  const statement = await extractStatement(job, noteText);
  if (statement !== null) await writeGraph(job, statement);
}

/**
 * Extraction and query building finish before anything is deleted, so a failed
 * model call never wipes the note's existing graph.
 */
async function extractStatement(job: SyncJob, noteText: string): Promise<string | null> {
  try {
    const graph = await extractNoteGraph(noteText);
    return buildMergeCypher(graph, job.noteId);
  } catch (error) {
    showExtractionError(job.toastId, job.title, error);
    return null;
  }
}

async function writeGraph(job: SyncJob, statement: string): Promise<void> {
  try {
    await deleteNoteGraph(job.noteId);
    await runCypher(statement);
    showGraphSaved(job.toastId, job.title);
  } catch (error) {
    showGraphError(job.toastId, job.title, error);
  }
}

function toNoteText(note: Note): string {
  return `${note.title}\n\n${note.body}`.trim();
}

function displayTitle(title: string): string {
  return title.trim() || "Untitled note";
}
