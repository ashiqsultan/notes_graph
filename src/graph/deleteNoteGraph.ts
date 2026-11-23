import {
  deleteNoteStatement,
  removeOrphansStatement,
} from "@/graph/noteGraphCypher";
import { readLinkedKeys, runWrite } from "@/graph/noteGraphClient";

/**
 * Removes a note and its links from the graph. Words that no other note
 * mentions are deleted too.
 */
export async function deleteNoteGraph(noteId: number): Promise<void> {
  const linkedKeys = await readLinkedKeys(noteId);
  await runWrite(deleteNoteStatement(noteId));
  if (linkedKeys.length === 0) return;

  await runWrite(removeOrphansStatement(linkedKeys));
}
