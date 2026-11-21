import { useState } from "react";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteNoteDialog } from "@/components/notes/DeleteNoteDialog";
import type { Note } from "@/db";
import { formatRelativeTime } from "@/lib/format";
import { useNotesStore } from "@/store";

/** A single note in the grid. Clicking it opens the composer in edit mode. */
function NoteCard({ note }: { note: Note }) {
  const openComposer = useNotesStore((state) => state.openComposer);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card
        size="sm"
        className="mb-4 cursor-pointer break-inside-avoid transition-shadow hover:shadow-lg"
        onClick={() => openComposer(note.id)}
      >
        <CardHeader>
          <CardTitle>{note.title || "Untitled"}</CardTitle>
          <CardAction>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete note"
              onClick={(event) => {
                event.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2Icon />
            </Button>
          </CardAction>
        </CardHeader>
        {note.body && (
          <CardContent>
            <p className="line-clamp-8 whitespace-pre-wrap text-muted-foreground">
              {note.body}
            </p>
          </CardContent>
        )}
        <CardFooter className="text-xs text-muted-foreground">
          Updated {formatRelativeTime(note.updatedAt)}
        </CardFooter>
      </Card>
      <DeleteNoteDialog
        note={note}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}

export { NoteCard };
