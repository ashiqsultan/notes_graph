import { useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import { seedDemoDataOnce } from "@/lib/seedDemoData";
import { useNotesStore } from "@/store";

export type SeedStatus = "idle" | "seeding" | "done";

/** Seeds the demo notes once the classifier model is ready. Returns the status and a way to dismiss the done message. */
export function useSeedDemoData(modelReady: boolean) {
  const [status, setStatus] = useState<SeedStatus>("idle");
  const fetchNotes = useNotesStore((state) => state.fetchNotes);
  const notifyGraphChanged = useNotesStore((state) => state.notifyGraphChanged);
  const resetSidebar = useNotesStore((state) => state.resetSidebar);

  useEffect(() => {
    if (!modelReady) return;
    seedDemoDataOnce(() => setStatus("seeding"))
      .then((seeded) => {
        if (!seeded) return;
        void fetchNotes();
        notifyGraphChanged();
        resetSidebar();
        setStatus("done");
      })
      .catch(() => {
        setStatus("idle");
        toast.add({ title: "Demo data could not be loaded.", type: "error" });
      });
  }, [modelReady, fetchNotes, notifyGraphChanged, resetSidebar]);

  return { status, dismiss: () => setStatus("idle") };
}
