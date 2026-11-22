import { useEffect } from "react";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NotesHeader } from "@/components/notes/NotesHeader";
import { NoteComposer } from "@/components/notes/NoteComposer";
import { TakeNoteBar } from "@/components/notes/TakeNoteBar";
import { Toaster } from "@/components/ui/toast";
import { GraphView } from "@/components/graph/GraphView";
import { AiChatView } from "@/components/chat/AiChatView";
import { useNotesStore } from "@/store";

function App() {
  const fetchNotes = useNotesStore((state) => state.fetchNotes);
  const view = useNotesStore((state) => state.view);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  return (
    <div className="min-h-svh bg-background">
      <NotesHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        {view === "graph" && <GraphView />}
        {view === "chat" && <AiChatView />}
        {view === "notes" && (
          <>
            <TakeNoteBar />
            <NotesGrid />
          </>
        )}
      </main>
      <NoteComposer />
      <Toaster />
    </div>
  );
}

export default App;
