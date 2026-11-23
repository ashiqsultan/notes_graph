import { useEffect, useEffectEvent, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AllNodesList } from "@/components/sidebar/AllNodesList";
import { CypherQueryForm } from "@/components/sidebar/CypherQueryForm";
import { GraphResultsTabs } from "@/components/sidebar/GraphResultsTabs";
import { GraphSearchInput } from "@/components/sidebar/GraphSearchInput";
import { NodeItemsList } from "@/components/sidebar/NodeItemsList";
import { SidebarShowAllButton } from "@/components/sidebar/SidebarShowAllButton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { entityItemsFromRows } from "@/graph/nodeItems";
import { nodeConnectionsQuery, nodeSearchQuery } from "@/graph/sidebarQueries";
import type { GraphData, RelateNode } from "@/graph/relateElements";

const SEARCH_DELAY_MS = 500;

interface GraphViewFullProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  graph: GraphData;
  rows: unknown[];
  running: boolean;
  error: string;
  typesVersion: number;
  queryText: string;
  onQueryTextChange: (query: string) => void;
  onShowAll: () => void;
  onSelectType: (type: string) => void;
  onRunQuery: (query: string) => void;
}

/** Large dialog: query, show all and node type filters on the left, the full-size graph on the right. */
function GraphViewFull({
  open,
  onOpenChange,
  graph,
  rows,
  running,
  error,
  typesVersion,
  queryText,
  onQueryTextChange,
  onShowAll,
  onSelectType,
  onRunQuery,
}: GraphViewFullProps) {
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebouncedValue(searchText, SEARCH_DELAY_MS);
  const entities = entityItemsFromRows(rows);

  const runSearch = useEffectEvent((text: string) => {
    const query = nodeSearchQuery(text);
    if (query) onRunQuery(query);
  });

  useEffect(() => {
    runSearch(debouncedSearch);
  }, [debouncedSearch]);

  function selectNode(node: RelateNode) {
    const query = nodeConnectionsQuery(node.id);
    onQueryTextChange(query);
    onRunQuery(query);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") event.preventDefault();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[95vw] max-w-none grid-rows-[auto_minmax(0,1fr)] sm:max-w-none">
        <DialogHeader>
          <DialogTitle>Graph view</DialogTitle>
          {/*<DialogDescription>Full-size view of the sidebar graph.</DialogDescription>*/}
        </DialogHeader>
        <div className="flex min-h-0 flex-col gap-4">
          <div className="mx-auto w-full max-w-xl">
            <GraphSearchInput
              value={searchText}
              onChange={setSearchText}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <div className="flex min-h-0 gap-4">
            <div className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto">
              <CypherQueryForm
                value={queryText}
                running={running}
                onChange={onQueryTextChange}
                onRun={onRunQuery}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex align-middle gap-2">
                <SidebarShowAllButton onClick={onShowAll} disabled={running} />
                <AllNodesList onSelectType={onSelectType} typesVersion={typesVersion} />
              </div>
              <NodeItemsList nodes={entities} onSelectNode={selectNode} />
            </div>
            <GraphResultsTabs graph={graph} rows={rows} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { GraphViewFull };
