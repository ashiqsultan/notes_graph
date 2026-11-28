import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClearNotesSetting } from "@/components/settings/ClearNotesSetting";
import { ExportBackupSetting } from "@/components/settings/ExportBackupSetting";

/** Header button that opens the settings dialog. */
function SettingsDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon-lg"
        className="size-11 shrink-0"
        aria-label="Settings"
        onClick={() => setOpen(true)}
      >
        <Settings />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Manage your notes and graph.</DialogDescription>
          </DialogHeader>
          <ExportBackupSetting />
          <ClearNotesSetting onCleared={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export { SettingsDialog };
