import { StickyNoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotesStore, type AppView } from "@/store";

const VIEW_BUTTONS: { view: AppView; label: string }[] = [
  { view: "notes", label: "View Notes" },
  { view: "chat", label: "AI Chat" },
];

/** Top app bar with the brand, view switches, and a "New note" action. */
function NotesHeader() {
  const openComposer = useNotesStore((state) => state.openComposer);
  const view = useNotesStore((state) => state.view);
  const setView = useNotesStore((state) => state.setView);

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <StickyNoteIcon className="size-5 text-muted-foreground" />
          <h1 className="font-heading text-lg font-medium">Notes</h1>
        </div>
        <div className="flex items-center gap-2">
          {VIEW_BUTTONS.map(({ view: target, label }) => (
            <Button
              key={target}
              variant={target === view ? "default" : "outline"}
              onClick={() => setView(target)}
            >
              {label}
            </Button>
          ))}
          <Button onClick={() => openComposer()}>New note</Button>
        </div>
      </div>
    </header>
  );
}

export { NotesHeader };
