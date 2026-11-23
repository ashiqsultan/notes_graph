import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarShowAllButton } from "@/components/sidebar/SidebarShowAllButton";
import { SidebarGraphCanvas } from "@/components/sidebar/SidebarGraphCanvas";
import { SidebarAccordion } from "@/components/sidebar/SidebarAccordion";
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

  const controls = (
    <>
      <SidebarShowAllButton onClick={() => void runStatement(SHOW_ALL_QUERY)} disabled={running} />
      <SidebarAccordion onSelectType={(type) => void runStatement(nodesOfTypeQuery(type))} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => setExpanded(true)} aria-label="Expand graph view">
          <Maximize2 />
        </Button>
      </div>
      {controls}
      <SidebarGraphCanvas graph={graph} />
      <GraphViewFull open={expanded} onOpenChange={setExpanded} graph={graph} />
    </div>
  );
}

export { SidebarGraph };
