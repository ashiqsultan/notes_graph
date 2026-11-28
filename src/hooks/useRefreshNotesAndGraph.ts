import { useNotesStore } from "@/store";

/** Returns a function that reloads the notes and resets the sidebar so every view shows the current data. */
export function useRefreshNotesAndGraph(): () => void {
  const fetchNotes = useNotesStore((state) => state.fetchNotes);
  const notifyGraphChanged = useNotesStore((state) => state.notifyGraphChanged);
  const resetSidebar = useNotesStore((state) => state.resetSidebar);

  return () => {
    void fetchNotes();
    notifyGraphChanged();
    resetSidebar();
  };
}
