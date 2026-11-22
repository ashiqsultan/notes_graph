import { useEffect, type CSSProperties } from "react";
import { useSidebarResize } from "@/hooks/use-sidebar-resize";
import { SidebarResizeHandle } from "@/components/sidebar/SidebarResizeHandle";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NotesHeader } from "@/components/notes/NotesHeader";
import { NoteComposer } from "@/components/notes/NoteComposer";
import { TakeNoteBar } from "@/components/notes/TakeNoteBar";
import { Toaster } from "@/components/ui/toast";
import { GraphView } from "@/components/graph/GraphView";
import { AiChatView } from "@/components/chat/AiChatView";
import { ModelDownloadDialog } from "@/components/chat/ModelDownloadDialog";
import { useNotesStore } from "@/store";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

function App() {
  const fetchNotes = useNotesStore((state) => state.fetchNotes);
  const loadModel = useNotesStore((state) => state.loadModel);
  const llm = useNotesStore((state) => state.llm);
  const view = useNotesStore((state) => state.view);
  const { width: sidebarWidth, startResize } = useSidebarResize();

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    loadModel();
  }, [loadModel]);

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <Sidebar>
        <SidebarContent>
          <p className="p-4 text-sm">Hello world</p>
        </SidebarContent>
        <SidebarResizeHandle onPointerDown={startResize} />
      </Sidebar>
      <SidebarInset>
        <ModelDownloadDialog open={llm.status === "loading"} progress={llm.progress} />
        <NotesHeader />
        <div className="mx-auto w-full max-w-5xl px-4 py-6">
          {view === "graph" && <GraphView />}
          {view === "chat" && <AiChatView />}
          {view === "notes" && (
            <>
              <TakeNoteBar />
              <NotesGrid />
            </>
          )}
        </div>
        <NoteComposer />
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
