import { envelopeError, envelopeRows } from "@/graph/envelopeRows";
import { isRecord } from "@/graph/relateElements";

/** Returns the sorted node types linked to each note, keyed by note id. Throws when relate reported an error. */
export function readNoteTypes(text: string): Map<number, string[]> {
  const error = envelopeError(text);
  if (error) throw new Error(error);
  return new Map(envelopeRows(text).flatMap(toNoteTypes));
}

function toNoteTypes(row: unknown): [number, string[]][] {
  if (!isRecord(row) || typeof row.noteId !== "string" || !Array.isArray(row.types)) return [];
  return [[Number(row.noteId), sortedStrings(row.types)]];
}

function sortedStrings(values: unknown[]): string[] {
  return values.filter((value): value is string => typeof value === "string").sort();
}
