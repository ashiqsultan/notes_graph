import { Network, PlusIcon, StickyNoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NodeTypesSettings } from "@/components/settings/NodeTypesSettings";
import { NotesSearchBar } from "@/components/notes/NotesSearchBar";
import { useNotesStore } from "@/store";

/** Full-width top app bar: brand, search, and the New note, graph and node type actions, aligned to the start. */
function NotesHeader() {
  const openComposer = useNotesStore((state) => state.openComposer);
  const setGraphExpanded = useNotesStore((state) => state.setGraphExpanded);

  return (
    <header className="flex shrink-0 items-center gap-4 border-b bg-background px-4 py-3 md:px-6">
      <h1 className="shrink-0">
        <Button
          variant="ghost"
          className="h-auto gap-2 px-2 py-1.5 font-heading text-lg font-medium"
          aria-label="Notes Graph — create new note"
          onClick={() => openComposer()}
        >
          <StickyNoteIcon className="size-5 text-muted-foreground" />
          Notes Graph
        </Button>
      </h1>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="min-w-0 flex-1">
          <NotesSearchBar />
        </div>
        <Button
          className="h-11 px-4 max-md:w-11 max-md:px-0"
          aria-label="New note"
          onClick={() => openComposer()}
        >
          <PlusIcon />
          <span className="max-md:hidden">New note</span>
        </Button>
        <Button
          variant="outline"
          size="icon-lg"
          className="size-11 shrink-0 md:hidden"
          aria-label="Open graph view"
          onClick={() => setGraphExpanded(true)}
        >
          <Network />
        </Button>
        <div className="shrink-0">
          <NodeTypesSettings />
        </div>
      </div>
    </header>
  );
}

export { NotesHeader };
