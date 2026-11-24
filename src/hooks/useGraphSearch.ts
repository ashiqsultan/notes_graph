import { useEffect, useEffectEvent } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { nodeSearchQuery } from "@/graph/sidebarQueries";
import { useNotesStore } from "@/store";

const SEARCH_DELAY_MS = 500;

/** Runs a node search query once the shared search text stops changing, or runs the blank-search handler when it is blank. */
export function useGraphSearch(onRunSearch: (query: string) => void, onBlankSearch: () => void) {
  const searchText = useNotesStore((state) => state.searchText);
  const debouncedSearch = useDebouncedValue(searchText, SEARCH_DELAY_MS);

  const runSearch = useEffectEvent((text: string) => {
    const query = nodeSearchQuery(text);
    if (query) onRunSearch(query);
    else onBlankSearch();
  });

  useEffect(() => {
    runSearch(debouncedSearch);
  }, [debouncedSearch]);
}
