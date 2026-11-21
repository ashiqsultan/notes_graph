import { create } from "zustand";
import type { Note } from "@/db";
import {
  createNote,
  deleteNote,
  getAllNotes,
  updateNote,
  type NoteInput,
} from "@/lib/notes";

interface NotesState {
  /** All notes, most recently updated first. */
  notes: Note[];
  /** Whether the composer dialog is open. */
  composerOpen: boolean;
  /** The id of the note being edited, or null when composing a new note. */
  editingNoteId: number | null;

  /** Loads all notes from IndexedDB into state. */
  fetchNotes: () => Promise<void>;
  /** Creates or updates a note (depending on `editingNoteId`), then closes the composer. */
  saveNote: (input: NoteInput) => Promise<void>;
  /** Deletes a note from IndexedDB and state. */
  removeNote: (id: number) => Promise<void>;
  /** Opens the composer, optionally in edit mode for the given note id. */
  openComposer: (noteId?: number) => void;
  /** Closes the composer and clears the editing state. */
  closeComposer: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  composerOpen: false,
  editingNoteId: null,

  fetchNotes: async () => {
    const notes = await getAllNotes();
    set({ notes });
  },

  saveNote: async (input) => {
    const { editingNoteId } = get();

    if (editingNoteId !== null) {
      await updateNote(editingNoteId, input);
    } else {
      await createNote(input);
    }

    await get().fetchNotes();
    set({ composerOpen: false, editingNoteId: null });
  },

  removeNote: async (id) => {
    await deleteNote(id);
    await get().fetchNotes();
  },

  openComposer: (noteId) =>
    set({ composerOpen: true, editingNoteId: noteId ?? null }),

  closeComposer: () => set({ composerOpen: false, editingNoteId: null }),
}));
