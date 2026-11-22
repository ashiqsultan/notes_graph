import { useState } from "react";
import { SidebarShowAllButton } from "@/components/sidebar/SidebarShowAllButton";
import { SidebarGraphCanvas } from "@/components/sidebar/SidebarGraphCanvas";
import { SidebarAccordion } from "@/components/sidebar/SidebarAccordion";
import { runCypher } from "@/graph/relateClient";
import { graphFromEnvelope } from "@/graph/graphFromEnvelope";
import { EMPTY_GRAPH, type GraphData } from "@/graph/relateElements";
import { SHOW_ALL_QUERY, nodeWithRelationsQuery } from "@/graph/sidebarQueries";

/** Sidebar graph section: a "Show all" button, the node and relation lists, and the graph they load. */
function SidebarGraph() {
  const [graph, setGraph] = useState<GraphData>(EMPTY_GRAPH);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="flex flex-col gap-2 p-2">
      <SidebarShowAllButton onClick={() => void runStatement(SHOW_ALL_QUERY)} disabled={running} />
      <SidebarAccordion onSelectNode={(nodeId) => void runStatement(nodeWithRelationsQuery(nodeId))} />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <SidebarGraphCanvas graph={graph} />
    </div>
  );
}

export { SidebarGraph };
