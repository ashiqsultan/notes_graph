import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarShowAllButton } from "@/components/sidebar/SidebarShowAllButton";
import { SidebarGraphCanvas } from "@/components/sidebar/SidebarGraphCanvas";
import { AllNodesList } from "@/components/sidebar/AllNodesList";
import { GraphViewFull } from "@/components/sidebar/GraphViewFull";
import { runCypher } from "@/graph/relateClient";
import { graphFromEnvelope } from "@/graph/graphFromEnvelope";
import { EMPTY_GRAPH, type GraphData } from "@/graph/relateElements";
import { SHOW_ALL_QUERY, nodesOfTypeQuery } from "@/graph/sidebarQueries";

/** Sidebar graph section: a "Show all" button, the node type pills, and the graph they load. */
function SidebarGraph() {
  const [graph, setGraph] = useState<GraphData>(EMPTY_GRAPH);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  async function runStatement(statement: string) {
    setRunning(true);
    setError("");
    try {
      const text = await runCypher(statement);
      setGraph(graphFromEnvelope(text));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setGraph(EMPTY_GRAPH);
    } finally {
      setRunning(false);
    }
  }

  function showAll() {
    void runStatement(SHOW_ALL_QUERY);
  }

  function showType(type: string) {
    void runStatement(nodesOfTypeQuery(type));
  }

  const controls = (
    <>
      <div className="flex gap-2">
        <SidebarShowAllButton onClick={showAll} disabled={running} className="flex-1" />
        <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={() => setExpanded(true)}>
          Expand
          <Maximize2 />
        </Button>
      </div>
      <AllNodesList onSelectType={showType} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      {controls}
      <SidebarGraphCanvas graph={graph} className="mt-2" />
      <GraphViewFull
        open={expanded}
        onOpenChange={setExpanded}
        graph={graph}
        running={running}
        onShowAll={showAll}
        onSelectType={showType}
      />
    </div>
  );
}

export { SidebarGraph };
