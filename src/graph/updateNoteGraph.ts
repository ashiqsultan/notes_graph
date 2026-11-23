import type { NoteWord } from "@/graph/getWords";
import { planWordChanges } from "@/graph/planWordChanges";
import {
  removeLinksStatement,
  removeOrphansStatement,
  upsertNoteStatement,
} from "@/graph/noteGraphCypher";
import { readLinkedKeys, runWrite } from "@/graph/noteGraphClient";

/**
 * Makes the graph match a note's words. Words the note already links to are
 * left untouched, new words are linked, and words no longer in the text are
 * unlinked. Words that no note mentions any more are deleted.
 */
export async function updateNoteGraph(
  noteId: number,
  title: string,
  words: NoteWord[],
): Promise<void> {
  const linkedKeys = await readLinkedKeys(noteId);
  const { toAdd, toRemove } = planWordChanges(linkedKeys, words);

  await runWrite(upsertNoteStatement(noteId, title, toAdd));
  if (toRemove.length === 0) return;

  await runWrite(removeLinksStatement(noteId, toRemove));
  await runWrite(removeOrphansStatement(toRemove));
}
