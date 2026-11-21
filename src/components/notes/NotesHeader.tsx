import { StickyNoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotesStore } from "@/store";

/** Top app bar with the brand and a "New note" action. */
function NotesHeader() {
  const openComposer = useNotesStore((state) => state.openComposer);

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <StickyNoteIcon className="size-5 text-muted-foreground" />
          <h1 className="font-heading text-lg font-medium">Notes</h1>
        </div>
        <Button onClick={() => openComposer()}>New note</Button>
      </div>
    </header>
  );
}

export { NotesHeader };
