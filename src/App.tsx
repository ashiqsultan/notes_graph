import { useEffect } from "react";
import { SidebarGraph } from "@/components/sidebar/SidebarGraph";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NotesHeader } from "@/components/notes/NotesHeader";
import { NoteComposer } from "@/components/notes/NoteComposer";
import { Toaster } from "@/components/ui/toast";
import { ModelDownloadDialog } from "@/components/model/ModelDownloadDialog";
import { useNotesStore } from "@/store";

function App() {
  const fetchNotes = useNotesStore((state) => state.fetchNotes);
  const loadClassifier = useNotesStore((state) => state.loadClassifier);
  const classifier = useNotesStore((state) => state.classifier);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    loadClassifier();
  }, [loadClassifier]);

  return (
    <div className="flex h-dvh flex-col bg-background">
      <ModelDownloadDialog
        open={classifier.status === "loading"}
        progress={classifier.progress}
      />
      <NotesHeader />
      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 md:flex-none md:w-[65%] md:px-6">
          <NotesGrid />
        </main>
        <aside className="hidden w-[35%] shrink-0 flex-col overflow-y-auto border-l md:flex">
          <SidebarGraph />
        </aside>
      </div>
      <NoteComposer />
      <Toaster />
    </div>
  );
}

export default App;
