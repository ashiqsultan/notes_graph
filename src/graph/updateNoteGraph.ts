import type { NoteWord } from "@/graph/getWords";
import { classifyWords } from "@/graph/classifyWords";
import { planWordChanges } from "@/graph/planWordChanges";
import {
  removeLinksStatement,
  removeOrphansStatement,
  upsertNoteStatement,
} from "@/graph/noteGraphCypher";
import { readLinkedKeys, runWrite } from "@/graph/noteGraphClient";
import { getNodeTypeOptions } from "@/lib/nodeTypes";

/**
 * Makes the graph match a note's words. Words the note already links to are
 * left untouched, new words are classified and linked, and words no longer in
 * the text are unlinked. Words that no note mentions any more are deleted.
 */
export async function updateNoteGraph(
  noteId: number,
  title: string,
  noteText: string,
  words: NoteWord[],
): Promise<void> {
  const linkedKeys = await readLinkedKeys(noteId);
  const { toAdd, toRemove } = planWordChanges(linkedKeys, words);

  const nodeTypes = await getNodeTypeOptions();
  const typedWords = await classifyWords(toAdd, noteText, nodeTypes);
  await runWrite(upsertNoteStatement(noteId, title, typedWords));
  if (toRemove.length === 0) return;

  await runWrite(removeLinksStatement(noteId, toRemove));
  await runWrite(removeOrphansStatement(toRemove));
}
