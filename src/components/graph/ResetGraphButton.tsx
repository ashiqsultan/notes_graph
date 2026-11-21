import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { resetGraph } from "@/graph/relateClient";

interface ResetGraphButtonProps {
  /** Called after the graph has been wiped. */
  onReset: () => void;
}

/** Dev-only button that asks for confirmation before wiping the graph. */
function ResetGraphButton({ onReset }: ResetGraphButtonProps) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setRunning(true);
    setError("");
    try {
      await resetGraph();
      onReset();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        Reset graph
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset the graph?</AlertDialogTitle>
          <AlertDialogDescription>
            This deletes every node and relationship in the graph. Notes are not affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm} disabled={running}>
            {running ? "Resetting…" : "Reset"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ResetGraphButton };
