import { useRef, useState, type ChangeEvent } from "react";
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
import { useRefreshNotesAndGraph } from "@/hooks/useRefreshNotesAndGraph";
import { restoreBackup } from "@/lib/restoreBackup";

interface RestoreBackupSettingProps {
  /** Called after the backup was restored successfully. */
  onRestored: () => void;
}

/** Settings row that replaces every note and the graph with a chosen backup file, after a confirmation. */
function RestoreBackupSetting({ onRestored }: RestoreBackupSettingProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [restoring, setRestoring] = useState(false);
  const refreshAfterRestore = useRefreshNotesAndGraph();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) setPickedFile(file);
  }

  async function confirmRestore() {
    if (!pickedFile) return;
    setRestoring(true);
    const restored = await attemptRestore(pickedFile);
    setRestoring(false);
    if (!restored) return;
    setPickedFile(null);
    refreshAfterRestore();
    onRestored();
    toast.add({ title: "Backup restored", type: "success" });
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button variant="outline" onClick={() => inputRef.current?.click()}>
        Restore backup
      </Button>

      <AlertDialog
        open={pickedFile !== null}
        onOpenChange={(isOpen) => {
          if (!restoring && !isOpen) setPickedFile(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently replace all notes and the graph with the contents of{" "}
              {pickedFile?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={restoring} onClick={confirmRestore}>
              {restoring && <Loader2Icon className="animate-spin" aria-hidden="true" />}
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Runs the restore and reports any failure as a toast. Returns whether it succeeded. */
async function attemptRestore(file: File): Promise<boolean> {
  try {
    await restoreBackup(file);
    return true;
  } catch (err) {
    toast.add({
      title: err instanceof Error ? `Restore failed: ${err.message}` : "Restore failed.",
      type: "error",
    });
    return false;
  }
}

export { RestoreBackupSetting };
