import { create } from "zustand";
import type { Note } from "@/db";
import { queueNoteGraphSync } from "@/graph/syncNoteGraph";
import { preloadClassifier } from "@/graph/classifierClient";
import {
  INITIAL_CLASSIFIER_STATE,
  reduceClassifierResponse,
  type ClassifierState,
} from "@/lib/classifierState";
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
  /** Increments on every open so the composer form can remount per session. */
  composerSession: number;
  /** A saved note whose entities have not been written to the graph yet. */
  unsyncedNoteId: number | null;
  /** Classifier model download status. */
  classifier: ClassifierState;

  /** Loads all notes from IndexedDB into state. */
  fetchNotes: () => Promise<void>;
  /** Creates or updates a note (depending on `editingNoteId`) without closing the composer. */
  persistNote: (input: NoteInput) => Promise<void>;
  /** Deletes a note from IndexedDB and state, and removes it from the graph. */
  removeNote: (id: number) => Promise<void>;
  /** Opens the composer, optionally in edit mode for the given note id. */
  openComposer: (noteId?: number) => void;
  /** Closes the composer and clears the editing state. */
  closeComposer: () => void;
  /** Queues the graph update for the note saved in the composer, if any. */
  syncUnsyncedNote: () => void;
  /** Starts downloading and loading the classifier model. Safe to call more than once. */
  loadClassifier: () => void;
}

let classifierLoadStarted = false;

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  composerOpen: false,
  editingNoteId: null,
  composerSession: 0,
  unsyncedNoteId: null,
  classifier: INITIAL_CLASSIFIER_STATE,

  fetchNotes: async () => {
    const notes = await getAllNotes();
    set({ notes });
  },

  persistNote: async (input) => {
    const { editingNoteId } = get();

    if (editingNoteId !== null) {
      await updateNote(editingNoteId, input);
      set({ unsyncedNoteId: editingNoteId });
    } else if (input.title || input.body) {
      const note = await createNote(input);
      set({ editingNoteId: note.id, unsyncedNoteId: note.id });
    }

    await get().fetchNotes();
  },

  removeNote: async (id) => {
    await deleteNote(id);
    await get().fetchNotes();
    void queueNoteGraphSync(id);
  },

  openComposer: (noteId) =>
    set((state) => ({
      composerOpen: true,
      editingNoteId: noteId ?? null,
      composerSession: state.composerSession + 1,
    })),

  closeComposer: () => set({ composerOpen: false, editingNoteId: null }),

  syncUnsyncedNote: () => {
    const { unsyncedNoteId } = get();
    if (unsyncedNoteId === null) return;

    set({ unsyncedNoteId: null });
    void queueNoteGraphSync(unsyncedNoteId);
  },

  loadClassifier: () => {
    if (classifierLoadStarted) return;
    classifierLoadStarted = true;

    preloadClassifier((response) => {
      set((state) => ({ classifier: reduceClassifierResponse(state.classifier, response) }));
    });
  },
}));
