import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { clearAll } from "@/lib/clearAll";
import { useNotesStore } from "@/store";

interface ClearNotesSettingProps {
  /** Called after the notes and graph were cleared successfully. */
  onCleared: () => void;
}

/** Settings row that clears every note and the graph, after a confirmation. */
function ClearNotesSetting({ onCleared }: ClearNotesSettingProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const refreshAfterClear = useRefreshAfterClear();

  async function confirmClear() {
    setClearing(true);
    const cleared = await attemptClear();
    setClearing(false);
    if (!cleared) return;
    setConfirmOpen(false);
    refreshAfterClear();
    onCleared();
    toast.add({ title: "All notes cleared", type: "success" });
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
        Clear Notes
      </Button>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(isOpen) => {
          if (!clearing) setConfirmOpen(isOpen);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all notes and the graph. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={clearing} onClick={confirmClear}>
              {clearing && <Loader2Icon className="animate-spin" aria-hidden="true" />}
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Runs the clear and reports any failure as a toast. Returns whether it succeeded. */
async function attemptClear(): Promise<boolean> {
  try {
    await clearAll();
    return true;
  } catch (err) {
    toast.add({
      title: err instanceof Error ? `Clear failed: ${err.message}` : "Clear failed.",
      type: "error",
    });
    return false;
  }
}

/** Returns a function that reloads the notes and resets the sidebar so every view shows the empty state. */
function useRefreshAfterClear(): () => void {
  const fetchNotes = useNotesStore((state) => state.fetchNotes);
  const notifyGraphChanged = useNotesStore((state) => state.notifyGraphChanged);
  const resetSidebar = useNotesStore((state) => state.resetSidebar);

  return () => {
    void fetchNotes();
    notifyGraphChanged();
    resetSidebar();
  };
}

export { ClearNotesSetting };
