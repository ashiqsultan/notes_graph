import { create } from "zustand";
import type { Note } from "@/db";
import {
  createNote,
  deleteNote,
  getAllNotes,
  updateNote,
  type NoteInput,
} from "@/lib/notes";

export type AppView = "notes" | "graph";

interface NotesState {
  /** Which main view is shown: the notes list or the Cypher graph view. */
  view: AppView;
  /** All notes, most recently updated first. */
  notes: Note[];
  /** Whether the composer dialog is open. */
  composerOpen: boolean;
  /** The id of the note being edited, or null when composing a new note. */
  editingNoteId: number | null;
  /** Increments on every open so the composer form can remount per session. */
  composerSession: number;

  /** Loads all notes from IndexedDB into state. */
  fetchNotes: () => Promise<void>;
  /** Creates or updates a note (depending on `editingNoteId`) without closing the composer. */
  persistNote: (input: NoteInput) => Promise<void>;
  /** Deletes a note from IndexedDB and state. */
  removeNote: (id: number) => Promise<void>;
  /** Opens the composer, optionally in edit mode for the given note id. */
  openComposer: (noteId?: number) => void;
  /** Closes the composer and clears the editing state. */
  closeComposer: () => void;
  /** Switches the main view between notes and the graph. */
  setView: (view: AppView) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  view: "notes",
  notes: [],
  composerOpen: false,
  editingNoteId: null,
  composerSession: 0,

  fetchNotes: async () => {
    const notes = await getAllNotes();
    set({ notes });
  },

  persistNote: async (input) => {
    const { editingNoteId } = get();

    if (editingNoteId !== null) {
      await updateNote(editingNoteId, input);
    } else if (input.title || input.body) {
      const note = await createNote(input);
      set({ editingNoteId: note.id });
    }

    await get().fetchNotes();
  },

  removeNote: async (id) => {
    await deleteNote(id);
    await get().fetchNotes();
  },

  openComposer: (noteId) =>
    set((state) => ({
      composerOpen: true,
      editingNoteId: noteId ?? null,
      composerSession: state.composerSession + 1,
    })),

  closeComposer: () => set({ composerOpen: false, editingNoteId: null }),

  setView: (view) => set({ view }),
}));
