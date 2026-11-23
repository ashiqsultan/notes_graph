import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DownloadProgress } from "@/lib/classifierState";

interface ModelDownloadDialogProps {
  open: boolean;
  progress: DownloadProgress | null;
}

const ignoreDismissRequest = () => {};

function describeProgress(progress: DownloadProgress | null): string {
  if (!progress) return "Loading model…";
  return `Downloading ${progress.file} (${Math.round(progress.percent)}%)`;
}

/** Blocking dialog shown while the classifier model loads. It cannot be dismissed. */
function ModelDownloadDialog({ open, progress }: ModelDownloadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={ignoreDismissRequest}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Preparing classifier model</DialogTitle>
          <DialogDescription>{describeProgress(progress)}</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Please wait. The app is unavailable until the model is ready.
        </p>
      </DialogContent>
    </Dialog>
  );
}

export { ModelDownloadDialog };
