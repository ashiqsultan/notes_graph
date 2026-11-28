import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SeedStatus } from "@/hooks/useSeedDemoData";

interface DemoDataDialogProps {
  status: SeedStatus;
  onDismiss: () => void;
}

/** Dialog shown while the demo notes load, then once with an OK button when they are ready. */
function DemoDataDialog({ status, onDismiss }: DemoDataDialogProps) {
  const seeding = status === "seeding";
  return (
    <Dialog
      open={status !== "idle"}
      onOpenChange={(isOpen) => {
        if (!isOpen && !seeding) onDismiss();
      }}
    >
      <DialogContent showCloseButton={false}>
        {seeding ? <SeedingContent /> : <DoneContent onDismiss={onDismiss} />}
      </DialogContent>
    </Dialog>
  );
}

function SeedingContent() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Loading demo data</DialogTitle>
        <DialogDescription>Demo data, you can remove this from settings</DialogDescription>
      </DialogHeader>
      <Loader2Icon className="mx-auto animate-spin" aria-hidden="true" />
    </>
  );
}

function DoneContent({ onDismiss }: { onDismiss: () => void }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Demo data ready</DialogTitle>
        <DialogDescription>
          Notes were seeded for demo and to play around. You can clear them from the settings menu.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button onClick={onDismiss}>OK</Button>
      </DialogFooter>
    </>
  );
}

export { DemoDataDialog };
