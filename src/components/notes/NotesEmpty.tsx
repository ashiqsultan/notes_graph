import { StickyNoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useNotesStore } from "@/store";

/** Shown when there are no notes yet. */
function NotesEmpty() {
  const openComposer = useNotesStore((state) => state.openComposer);

  return (
    <Empty className="border py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <StickyNoteIcon />
        </EmptyMedia>
        <EmptyTitle>No notes yet</EmptyTitle>
        <EmptyDescription>
          Your notes live here. Create your first one to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={() => openComposer()}>New note</Button>
      </EmptyContent>
    </Empty>
  );
}

export { NotesEmpty };
