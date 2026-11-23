import nlp from "compromise";
import { FALLBACK_NODE_TYPE, type NodeType } from "@/graph/nodeTypes";

export interface NoteWord {
  /** Lowercase form, used to match the same word across notes. */
  key: string;
  /** Display form, as it reads in the note. */
  name: string;
  /** Classified type. Starts as the fallback until the classifier runs. */
  type: NodeType;
}

/** Returns the distinct nouns and noun phrases in a note's text. */
export function getWords(text: string): NoteWord[] {
  const words = new Map<string, NoteWord>();
  for (const word of findNounPhrases(text)) {
    if (!words.has(word.key)) words.set(word.key, word);
  }
  return [...words.values()];
}

function findNounPhrases(text: string): NoteWord[] {
  return nlp(text)
    .nouns()
    .not("#Pronoun")
    .not("#Determiner")
    .not("#Conjunction")
    .out("array")
    .flatMap(toNoteWords);
}

function toNoteWords(phrase: string): NoteWord[] {
  const name = cleanPhrase(phrase);
  if (!/\p{L}/u.test(name)) return [];
  return [{ key: name.toLowerCase(), name, type: FALLBACK_NODE_TYPE }];
}

/** Removes punctuation and extra spaces that the tagger keeps inside phrases. */
function cleanPhrase(value: string): string {
  return value.replace(/[^\p{L}\p{N}'\- ]+/gu, " ").replace(/\s+/g, " ").trim();
}
