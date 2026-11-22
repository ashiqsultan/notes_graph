import { useState } from "react";
import { SidebarShowAllButton } from "@/components/sidebar/SidebarShowAllButton";
import { SidebarGraphCanvas } from "@/components/sidebar/SidebarGraphCanvas";
import { runCypher } from "@/graph/relateClient";
import { graphFromEnvelope } from "@/graph/graphFromEnvelope";
import { EMPTY_GRAPH, type GraphData } from "@/graph/relateElements";

const SHOW_ALL_QUERY = "MATCH (n) OPTIONAL MATCH (n)-[r]-(m) RETURN n, r, m";

/** Sidebar graph section: a "Show all" button and the graph it loads. */
function SidebarGraph() {
  const [graph, setGraph] = useState<GraphData>(EMPTY_GRAPH);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function showAll() {
    setRunning(true);
    setError("");
    try {
      const text = await runCypher(SHOW_ALL_QUERY);
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
      <SidebarShowAllButton onClick={() => void showAll()} disabled={running} />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <SidebarGraphCanvas graph={graph} />
    </div>
  );
}

export { SidebarGraph };
