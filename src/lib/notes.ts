import { db, type Note } from "@/db";

/** The user-editable part of a note. */
export type NoteInput = Pick<Note, "title" | "body">;

/** Creates a new note with fresh timestamps. Returns the stored note. */
export async function createNote(input: NoteInput): Promise<Note> {
  const now = Date.now();
  const id = await db.notes.add({ ...input, createdAt: now, updatedAt: now });
  return { id, ...input, createdAt: now, updatedAt: now };
}

/** Fetches a single note by id. */
export async function getNote(id: number): Promise<Note | undefined> {
  return db.notes.get(id);
}

/** Fetches all notes, most recently updated first. */
export async function getAllNotes(): Promise<Note[]> {
  return db.notes.orderBy("updatedAt").reverse().toArray();
}

/** Updates a note's content and bumps `updatedAt`. */
export async function updateNote(id: number, input: NoteInput): Promise<void> {
  await db.notes.update(id, { ...input, updatedAt: Date.now() });
}

/** Permanently deletes a note. */
export async function deleteNote(id: number): Promise<void> {
  await db.notes.delete(id);
}

/** Permanently deletes every note. Node types are kept. */
export async function clearNotes(): Promise<void> {
  await db.notes.clear();
}
