import { toast } from "@/components/ui/toast";
import { buildMergeCypher } from "@/graph/buildMergeCypher";
import { deleteNoteGraph } from "@/graph/deleteNoteGraph";
import { extractNoteGraph } from "@/graph/extractNoteGraph";
import { runCypher } from "@/graph/relateClient";
import { isWebGpuAvailable } from "@/lib/llm";
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
    return syncNoteGraph(noteId).catch(reportSyncError);
  });
  return syncChain;
}

/**
 * Extraction and query building finish before anything is deleted, so a failed
 * model call never wipes the note's existing graph.
 */
async function syncNoteGraph(noteId: number): Promise<void> {
  const noteText = await readNoteText(noteId);
  if (noteText && !isWebGpuAvailable()) return;

  const statement = noteText ? await buildNoteStatement(noteText, noteId) : null;
  await deleteNoteGraph(noteId);
  if (statement) await runCypher(statement);
}

async function readNoteText(noteId: number): Promise<string> {
  const note = await getNote(noteId);
  if (!note) return "";
  return `${note.title}\n\n${note.body}`.trim();
}

async function buildNoteStatement(noteText: string, noteId: number): Promise<string | null> {
  const graph = await extractNoteGraph(noteText);
  return buildMergeCypher(graph, noteId);
}

function reportSyncError(error: unknown): void {
  const description = error instanceof Error ? error.message : String(error);
  console.error("Graph sync failed", error);
  toast.add({ title: "Could not update the graph", description, type: "error" });
}
