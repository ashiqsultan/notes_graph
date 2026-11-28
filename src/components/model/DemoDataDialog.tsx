import { Loader2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DemoDataDialogProps {
  open: boolean;
}

const ignoreDismissRequest = () => {};

/** Blocking dialog shown while the demo notes are loaded. It cannot be dismissed. */
function DemoDataDialog({ open }: DemoDataDialogProps) {
  return (
    <Dialog open={open} onOpenChange={ignoreDismissRequest}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Loading demo data</DialogTitle>
          <DialogDescription>Demo data, you can remove this from settings</DialogDescription>
        </DialogHeader>
        <Loader2Icon className="mx-auto animate-spin" aria-hidden="true" />
      </DialogContent>
    </Dialog>
  );
}

export { DemoDataDialog };
