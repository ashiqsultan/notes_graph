import { useEffect } from "react";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NotesHeader } from "@/components/notes/NotesHeader";
import { NoteComposer } from "@/components/notes/NoteComposer";
import { TakeNoteBar } from "@/components/notes/TakeNoteBar";
import { Toaster } from "@/components/ui/toast";
import { GraphView } from "@/components/graph/GraphView";
import { AiChatView } from "@/components/chat/AiChatView";
import { ModelDownloadDialog } from "@/components/chat/ModelDownloadDialog";
import { useNotesStore } from "@/store";

function App() {
  const fetchNotes = useNotesStore((state) => state.fetchNotes);
  const loadModel = useNotesStore((state) => state.loadModel);
  const llm = useNotesStore((state) => state.llm);
  const view = useNotesStore((state) => state.view);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    loadModel();
  }, [loadModel]);

  return (
    <div className="min-h-svh bg-background">
      <ModelDownloadDialog open={llm.status === "loading"} progress={llm.progress} />
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
