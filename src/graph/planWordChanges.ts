import type { NoteWord } from "@/graph/getWords";

export interface WordChanges {
  /** Words the note now mentions but is not linked to yet. */
  toAdd: NoteWord[];
  /** Keys of linked words the note no longer mentions. */
  toRemove: string[];
}

/** Compares the words a note is linked to with the words in its text now. */
export function planWordChanges(linkedKeys: string[], words: NoteWord[]): WordChanges {
  const linked = new Set(linkedKeys);
  const wanted = new Set(words.map((word) => word.key));
  return {
    toAdd: words.filter((word) => !linked.has(word.key)),
    toRemove: linkedKeys.filter((key) => !wanted.has(key)),
  };
}
