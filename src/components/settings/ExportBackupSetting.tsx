import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { exportBackup } from "@/lib/exportBackup";

/** Settings row that downloads every note and the graph as one JSON file. */
function ExportBackupSetting() {
  const [exporting, setExporting] = useState(false);

  async function startExport() {
    setExporting(true);
    try {
      await exportBackup();
    } catch (err) {
      toast.add({
        title: err instanceof Error ? `Export failed: ${err.message}` : "Export failed.",
        type: "error",
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button variant="outline" disabled={exporting} onClick={startExport}>
      {exporting && <Loader2Icon className="animate-spin" aria-hidden="true" />}
      Export backup
    </Button>
  );
}

export { ExportBackupSetting };
