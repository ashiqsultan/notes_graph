import { PlusIcon } from "lucide-react";
import { useNotesStore } from "@/store";

/** The "Take a note..." pill shown above the grid, like Google Keep. */
function TakeNoteBar() {
  const openComposer = useNotesStore((state) => state.openComposer);

  return (
    <button
      type="button"
      onClick={() => openComposer()}
      className="mb-6 flex w-full items-center gap-3 rounded-xl border border-input bg-card px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
    >
      <PlusIcon className="size-4" />
      Take a note...
    </button>
  );
}

export { TakeNoteBar };
