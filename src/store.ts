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
  /** Increments whenever the graph changes, so views of graph data can reload. */
  graphVersion: number;
  /** The text typed into the search box shared by the notes grid and the sidebar graph. */
  searchText: string;
  /** Ids of the notes found by the last search, or null when no search has run. */
  matchingNoteIds: Set<number> | null;
  /** Whether the full-size graph view dialog is open. */
  graphExpanded: boolean;

  /** Loads all notes from IndexedDB into state. */
  fetchNotes: () => Promise<void>;
  /** Marks the graph as changed, e.g. after a node type is renamed or deleted. */
  notifyGraphChanged: () => void;
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
  /** Queues a graph update for a note and bumps `graphVersion` once it has run. */
  syncGraph: (noteId: number) => void;
  /** Starts downloading and loading the classifier model. Safe to call more than once. */
  loadClassifier: () => void;
  /** Updates the search text. */
  setSearchText: (text: string) => void;
  /** Sets the note ids that match the search, or null to stop filtering. */
  setMatchingNoteIds: (ids: Set<number> | null) => void;
  /** Opens or closes the full-size graph view dialog. */
  setGraphExpanded: (expanded: boolean) => void;
}

let classifierLoadStarted = false;

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  composerOpen: false,
  editingNoteId: null,
  composerSession: 0,
  unsyncedNoteId: null,
  classifier: INITIAL_CLASSIFIER_STATE,
  graphVersion: 0,
  searchText: "",
  matchingNoteIds: null,
  graphExpanded: false,

  setSearchText: (text) => set({ searchText: text }),

  setMatchingNoteIds: (ids) => set({ matchingNoteIds: ids }),

  setGraphExpanded: (expanded) => set({ graphExpanded: expanded }),

  fetchNotes: async () => {
    const notes = await getAllNotes();
    set({ notes });
  },

  notifyGraphChanged: () => set((state) => ({ graphVersion: state.graphVersion + 1 })),

  syncGraph: (noteId) => {
    void queueNoteGraphSync(noteId).then(() => get().notifyGraphChanged());
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
    get().syncGraph(id);
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
    get().syncGraph(unsyncedNoteId);
  },

  loadClassifier: () => {
    if (classifierLoadStarted) return;
    classifierLoadStarted = true;

    preloadClassifier((response) => {
      set((state) => ({ classifier: reduceClassifierResponse(state.classifier, response) }));
    });
  },
}));
