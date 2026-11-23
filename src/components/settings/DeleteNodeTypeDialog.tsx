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
import type { NodeTypeEntry } from "@/db";
import { FALLBACK_NODE_TYPE } from "@/graph/nodeTypes";

interface DeleteNodeTypeDialogProps {
  /** The node type to delete, or null when the dialog is closed. */
  entry: NodeTypeEntry | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (entry: NodeTypeEntry) => void;
}

/** Confirmation dialog shown before a node type is deleted. */
function DeleteNodeTypeDialog({ entry, onOpenChange, onConfirm }: DeleteNodeTypeDialogProps) {
  function handleConfirm() {
    if (entry) onConfirm(entry);
  }

  return (
    <AlertDialog open={entry !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this node type?</AlertDialogTitle>
          <AlertDialogDescription>
            Words of type{" "}
            <span className="text-foreground">{entry?.type}</span> in your notes will
            become {FALLBACK_NODE_TYPE}. This action cannot be undone.
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

export { DeleteNodeTypeDialog };
