import type { Note } from "@/db";
import { deleteNoteGraph } from "@/graph/deleteNoteGraph";
import { getWords } from "@/graph/getWords";
import {
  dismissExtractionToast,
  showExtractionFinished,
  showExtractionStarted,
  showGraphError,
  showRemovalError,
  showUnexpectedError,
} from "@/graph/graphSyncToasts";
import { updateNoteGraph } from "@/graph/updateNoteGraph";
import { getNote } from "@/lib/notes";

let syncChain: Promise<void> = Promise.resolve();
const waitingNoteIds = new Set<number>();

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

/** Resolves once every graph update queued so far has finished. */
export function waitForGraphSyncs(): Promise<void> {
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
  const toastId = showExtractionStarted(title);
  try {
    await updateNoteGraph(noteId, title, noteText, getWords(noteText));
    showExtractionFinished(toastId, title);
  } catch (error) {
    dismissExtractionToast(toastId);
    showGraphError(title, error);
  }
}

function toNoteText(note: Note): string {
  return `${note.title}\n\n${note.body}`.trim();
}

function displayTitle(title: string): string {
  return title.trim() || "Untitled note";
}
