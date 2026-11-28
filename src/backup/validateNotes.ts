import type { Note } from "@/db";
import { isRecord } from "@/graph/relateElements";

/** Returns the usable notes of a backup. Incomplete notes are skipped silently, and a repeated id keeps its last note. */
export function validateNotes(value: unknown): Note[] {
  if (!Array.isArray(value)) throw new Error("notes must be a list");
  const notesById = new Map<number, Note>();
  for (const item of value) {
    if (isCompleteNote(item)) notesById.set(item.id, item);
  }
  return [...notesById.values()];
}

function isCompleteNote(value: unknown): value is Note {
  return (
    isRecord(value) &&
    Number.isInteger(value.id) &&
    typeof value.title === "string" &&
    typeof value.body === "string" &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt)
  );
}

function isTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
