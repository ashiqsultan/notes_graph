import { classifyText } from "@/graph/classifierClient";
import type { NoteWord } from "@/graph/getWords";

/** Returns the words with their types set by the classifier, using each word's sentence as context. */
export function classifyWords(words: NoteWord[], noteText: string): Promise<NoteWord[]> {
  return Promise.all(words.map((word) => classifyWord(word, noteText)));
}

async function classifyWord(word: NoteWord, noteText: string): Promise<NoteWord> {
  const sentence = findSentence(noteText, word.name);
  const type = await classifyText(word.name, sentence);
  return { ...word, type };
}

/** Returns the first sentence that contains the phrase, or the phrase itself. */
export function findSentence(text: string, phrase: string): string {
  const needle = phrase.toLowerCase();
  const sentences = text.split(/(?<=[.!?\n])\s*/);
  return sentences.find((sentence) => sentence.toLowerCase().includes(needle)) ?? phrase;
}
