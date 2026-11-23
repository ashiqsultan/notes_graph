import { useEffect, useEffectEvent, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { nodeSearchQuery } from "@/graph/sidebarQueries";

const SEARCH_DELAY_MS = 500;

/** Search text that runs a node search query once the user stops typing. */
export function useGraphSearch(onRunQuery: (query: string) => void) {
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebouncedValue(searchText, SEARCH_DELAY_MS);

  const runSearch = useEffectEvent((text: string) => {
    const query = nodeSearchQuery(text);
    if (query) onRunQuery(query);
  });

  useEffect(() => {
    runSearch(debouncedSearch);
  }, [debouncedSearch]);

  return { searchText, setSearchText };
}
