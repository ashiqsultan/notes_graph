import { resetGraph } from "@/graph/relateClient";
import { waitForGraphSyncs } from "@/graph/syncNoteGraph";
import { clearNotes } from "@/lib/notes";

/** Deletes every note and empties the graph. Node types are kept. */
export async function clearAll(): Promise<void> {
  await waitForGraphSyncs();
  await clearNotes();
  await resetGraph();
}
