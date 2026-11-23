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
import { entityItemsFromRows } from "@/graph/nodeItems";
import { EMPTY_GRAPH, type GraphData, type RelateNode } from "@/graph/relateElements";
import { SHOW_ALL_QUERY, nodeConnectionsQuery, nodesOfTypeQuery } from "@/graph/sidebarQueries";

/** Sidebar graph section: a "Show all" button, the node type pills, and the graph they load. */
function SidebarGraph() {
  const [graph, setGraph] = useState<GraphData>(EMPTY_GRAPH);
  const [rows, setRows] = useState<unknown[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [typesVersion, setTypesVersion] = useState(0);
  const [queryText, setQueryText] = useState("");
  const [expanded, setExpanded] = useState(false);

  async function runStatement(statement: string) {
    setQueryText(statement);
    setRunning(true);
    setError("");
    try {
      const text = await runCypher(statement);
      const statementError = envelopeError(text);
      if (statementError) throw new Error(statementError);
      setGraph(graphFromEnvelope(text));
      setRows(envelopeRows(text));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setGraph(EMPTY_GRAPH);
      setRows([]);
    } finally {
      setRunning(false);
      setTypesVersion((version) => version + 1);
    }
  }

  function showAll() {
    void runStatement(SHOW_ALL_QUERY);
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

  const entities = entityItemsFromRows(rows);

  const controls = (
    <>
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setExpanded(true)}>
        Expand
        <Maximize2 />
      </Button>
      <SidebarShowAllButton onClick={showAll} disabled={running} className="w-full" />
      <AllNodesList onSelectType={showType} typesVersion={typesVersion} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      {controls}
      <SidebarGraphCanvas graph={graph} className="mt-2" />
      <NodeItemsList nodes={entities} onSelectNode={selectNode} />
      <GraphViewFull
        open={expanded}
        onOpenChange={setExpanded}
        graph={graph}
        rows={rows}
        running={running}
        error={error}
        typesVersion={typesVersion}
        queryText={queryText}
        onQueryTextChange={setQueryText}
        onShowAll={showAll}
        onSelectType={showType}
        onRunQuery={runQuery}
      />
    </div>
  );
}

export { SidebarGraph };
