import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import type { Note } from "@/db";
import { useNotesStore } from "@/store";

interface DeleteNoteDialogProps {
  note: Note;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Confirmation dialog shown before a note is permanently deleted. */
function DeleteNoteDialog({ note, open, onOpenChange }: DeleteNoteDialogProps) {
  const removeNote = useNotesStore((state) => state.removeNote);

  async function handleConfirm() {
    onOpenChange(false);
    await removeNote(note.id);
    toast.add({ title: "Note deleted", type: "success" });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this note?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="text-foreground">
              {note.title || "this note"}
            </span>
            . This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { DeleteNoteDialog };
