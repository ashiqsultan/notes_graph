import { create } from "zustand";
import type { Note } from "@/db";
import { queueNoteGraphSync } from "@/graph/syncNoteGraph";
import {
  generateText,
  getLlmWorker,
  isWebGpuAvailable,
  postLlmRequest,
} from "@/lib/llm";
import type { WorkerResponse } from "@/lib/llmMessages";
import {
  createInitialLlmState,
  failGenerating,
  finishGenerating,
  reduceWorkerResponse,
  startGenerating,
  type LlmState,
} from "@/lib/llmState";
import {
  createNote,
  deleteNote,
  getAllNotes,
  updateNote,
  type NoteInput,
} from "@/lib/notes";

export type AppView = "notes" | "chat";

interface NotesState {
  /** Which main view is shown: the notes list or the AI chat. */
  view: AppView;
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
  /** Model download status and the latest chat reply. */
  llm: LlmState;

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
  /** Switches the main view between the notes and the AI chat. */
  setView: (view: AppView) => void;
  /** Starts downloading and loading the model. Safe to call more than once. */
  loadModel: () => void;
  /** Sends one chat prompt and stores the model's reply. */
  generateChatReply: (prompt: string) => Promise<void>;
}

let modelLoadStarted = false;

export const useNotesStore = create<NotesState>((set, get) => ({
  view: "notes",
  notes: [],
  composerOpen: false,
  editingNoteId: null,
  composerSession: 0,
  unsyncedNoteId: null,
  llm: createInitialLlmState(isWebGpuAvailable()),

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

  setView: (view) => set({ view }),

  loadModel: () => {
    if (modelLoadStarted || !isWebGpuAvailable()) return;
    modelLoadStarted = true;

    getLlmWorker().addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
      set((state) => ({ llm: reduceWorkerResponse(state.llm, event.data) }));
    });
    postLlmRequest({ type: "load" });
  },

  generateChatReply: async (prompt) => {
    set((state) => ({ llm: startGenerating(state.llm) }));
    try {
      const reply = await generateText(prompt);
      set((state) => ({ llm: finishGenerating(state.llm, reply) }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      set((state) => ({ llm: failGenerating(state.llm, message) }));
    }
  },
}));
