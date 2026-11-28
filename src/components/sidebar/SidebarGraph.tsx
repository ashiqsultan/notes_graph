import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarShowAllButton } from "@/components/sidebar/SidebarShowAllButton";
import { SidebarGraphCanvas } from "@/components/sidebar/SidebarGraphCanvas";
import { AllNodesList } from "@/components/sidebar/AllNodesList";
import { GraphViewFull } from "@/components/sidebar/GraphViewFull";
import { NodeItemsList } from "@/components/sidebar/NodeItemsList";
import { envelopeError, envelopeRows } from "@/graph/envelopeRows";
import { runCypher } from "@/graph/relateClient";
import { graphFromEnvelope } from "@/graph/graphFromEnvelope";
import { listableNodesFromRows } from "@/graph/nodeItems";
import { noteIdsFromRows } from "@/graph/noteIdsFromRows";
import { EMPTY_GRAPH, type GraphData, type RelateNode } from "@/graph/relateElements";
import { SHOW_ALL_QUERY, nodeConnectionsQuery, nodesOfTypeQuery } from "@/graph/sidebarQueries";
import { useGraphSearch } from "@/hooks/useGraphSearch";
import { useNotesStore } from "@/store";

/** Runs the initial show-all once per page load, not on sidebar remounts after a reset. */
let initialGraphLoadStarted = false;

/** Sidebar graph section: "Expand" and "Show all" buttons, the node type pills, and the graph they load. */
function SidebarGraph() {
  const [graph, setGraph] = useState<GraphData>(EMPTY_GRAPH);
  const [rows, setRows] = useState<unknown[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [typesVersion, setTypesVersion] = useState(0);
  const [queryText, setQueryText] = useState("");
  const searchText = useNotesStore((state) => state.searchText);
  const setSearchText = useNotesStore((state) => state.setSearchText);
  const matchingNoteIds = useNotesStore((state) => state.matchingNoteIds);
  const setMatchingNoteIds = useNotesStore((state) => state.setMatchingNoteIds);
  const expanded = useNotesStore((state) => state.graphExpanded);
  const setExpanded = useNotesStore((state) => state.setGraphExpanded);
  useGraphSearch(runSearch, showAllAfterBlankSearch);

  async function runStatement(statement: string): Promise<unknown[]> {
    setQueryText(statement);
    setRunning(true);
    setError("");
    try {
      const text = await runCypher(statement);
      const statementError = envelopeError(text);
      if (statementError) throw new Error(statementError);
      const resultRows = envelopeRows(text);
      setGraph(graphFromEnvelope(text));
      setRows(resultRows);
      return resultRows;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setGraph(EMPTY_GRAPH);
      setRows([]);
      return [];
    } finally {
      setRunning(false);
      setTypesVersion((version) => version + 1);
    }
  }

  function runSearch(query: string) {
    void runStatement(query).then((resultRows) => {
      setMatchingNoteIds(noteIdsFromRows(resultRows));
    });
  }

  function showAll() {
    void runStatement(SHOW_ALL_QUERY);
  }

  function showAllAfterBlankSearch() {
    // Skips the blank run when the sidebar remounts after a reset; page load still shows all.
    if (matchingNoteIds === null && initialGraphLoadStarted) return;
    initialGraphLoadStarted = true;
    setMatchingNoteIds(null);
    showAll();
  }

  function showType(type: string) {
    void runStatement(nodesOfTypeQuery(type));
  }

  function runQuery(query: string) {
    void runStatement(query);
  }

  function selectNode(node: RelateNode) {
    runQuery(nodeConnectionsQuery(node.id));
  }

  const listableNodes = listableNodesFromRows(rows);

  const controls = (
    <>
      <Button type="button" size="sm" className="w-full" onClick={() => setExpanded(true)}>
        Expand
        <Maximize2 />
      </Button>
      <AllNodesList
        onSelectType={showType}
        typesVersion={typesVersion}
        leading={
          <SidebarShowAllButton
            onClick={showAll}
            disabled={running}
            className="h-auto rounded-full px-2.5 py-1 text-xs font-medium"
          />
        }
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      {controls}
      <SidebarGraphCanvas graph={graph} className="mt-2" />
      <NodeItemsList nodes={listableNodes} onSelectNode={selectNode} />
      <GraphViewFull
        open={expanded}
        onOpenChange={setExpanded}
        graph={graph}
        rows={rows}
        running={running}
        error={error}
        typesVersion={typesVersion}
        queryText={queryText}
        searchText={searchText}
        onSearchChange={setSearchText}
        onQueryTextChange={setQueryText}
        onShowAll={showAll}
        onSelectType={showType}
        onRunQuery={runQuery}
      />
    </div>
  );
}

export { SidebarGraph };
