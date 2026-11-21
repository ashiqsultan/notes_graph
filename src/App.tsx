import { useEffect } from "react";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NotesHeader } from "@/components/notes/NotesHeader";
import { NoteComposer } from "@/components/notes/NoteComposer";
import { TakeNoteBar } from "@/components/notes/TakeNoteBar";
import { Toaster } from "@/components/ui/toast";
import { useNotesStore } from "@/store";

function App() {
  const fetchNotes = useNotesStore((state) => state.fetchNotes);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  return (
    <div className="min-h-svh bg-background">
      <NotesHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <TakeNoteBar />
        <NotesGrid />
      </main>
      <NoteComposer />
      <Toaster />
    </div>
  );
}

export default App;
