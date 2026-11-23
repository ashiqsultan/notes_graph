import { useEffect, type CSSProperties } from "react";
import { useSidebarResize } from "@/hooks/use-sidebar-resize";
import { SidebarResizeHandle } from "@/components/sidebar/SidebarResizeHandle";
import { SidebarGraph } from "@/components/sidebar/SidebarGraph";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NotesHeader } from "@/components/notes/NotesHeader";
import { NoteComposer } from "@/components/notes/NoteComposer";
import { TakeNoteBar } from "@/components/notes/TakeNoteBar";
import { Toaster } from "@/components/ui/toast";
import { ModelDownloadDialog } from "@/components/model/ModelDownloadDialog";
import { useNotesStore } from "@/store";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

function App() {
  const fetchNotes = useNotesStore((state) => state.fetchNotes);
  const loadClassifier = useNotesStore((state) => state.loadClassifier);
  const classifier = useNotesStore((state) => state.classifier);
  const { width: sidebarWidth, startResize } = useSidebarResize();

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    loadClassifier();
  }, [loadClassifier]);

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <Sidebar>
        <SidebarContent>
          <SidebarGraph />
        </SidebarContent>
        <SidebarResizeHandle onPointerDown={startResize} />
      </Sidebar>
      <SidebarInset>
        <ModelDownloadDialog
          open={classifier.status === "loading"}
          progress={classifier.progress}
        />
        <NotesHeader />
        <div className="mx-auto w-full max-w-5xl px-4 py-6">
          <TakeNoteBar />
          <NotesGrid />
        </div>
        <NoteComposer />
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
