import { GraphSearchInput } from "@/components/sidebar/GraphSearchInput";
import { useNotesStore } from "@/store";

/** Search box above the notes grid. Filters the notes and the sidebar graph. */
function NotesSearchBar() {
  const searchText = useNotesStore((state) => state.searchText);
  const setSearchText = useNotesStore((state) => state.setSearchText);

  return (
    <div className="w-full">
      <GraphSearchInput value={searchText} onChange={setSearchText} />
    </div>
  );
}

export { NotesSearchBar };
