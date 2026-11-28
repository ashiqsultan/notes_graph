import { useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import { seedDemoDataOnce } from "@/lib/seedDemoData";
import { useNotesStore } from "@/store";

/** Seeds the demo notes once the classifier model is ready. Returns whether seeding is running. */
export function useSeedDemoData(modelReady: boolean): boolean {
  const [seeding, setSeeding] = useState(false);
  const fetchNotes = useNotesStore((state) => state.fetchNotes);
  const notifyGraphChanged = useNotesStore((state) => state.notifyGraphChanged);
  const resetSidebar = useNotesStore((state) => state.resetSidebar);

  useEffect(() => {
    if (!modelReady) return;
    seedDemoDataOnce(() => setSeeding(true))
      .then(() => {
        void fetchNotes();
        notifyGraphChanged();
        resetSidebar();
      })
      .catch(() => toast.add({ title: "Demo data could not be loaded.", type: "error" }))
      .finally(() => setSeeding(false));
  }, [modelReady, fetchNotes, notifyGraphChanged, resetSidebar]);

  return seeding;
}
