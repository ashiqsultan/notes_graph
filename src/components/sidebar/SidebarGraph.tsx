import { useState } from "react";
import { SidebarShowAllButton } from "@/components/sidebar/SidebarShowAllButton";
import { SidebarGraphCanvas } from "@/components/sidebar/SidebarGraphCanvas";
import { SidebarAccordion } from "@/components/sidebar/SidebarAccordion";
import { SidebarQuestionInput } from "@/components/sidebar/SidebarQuestionInput";
import { SidebarRowsPreview } from "@/components/sidebar/SidebarRowsPreview";
import { useText2Cypher } from "@/hooks/use-text2cypher";
import { runCypher } from "@/graph/relateClient";
import { graphFromEnvelope } from "@/graph/graphFromEnvelope";
import { EMPTY_GRAPH, type GraphData } from "@/graph/relateElements";
import { SHOW_ALL_QUERY, nodeWithRelationsQuery } from "@/graph/sidebarQueries";

/** Sidebar graph section: a question box, a "Show all" button, the node and relation lists, and the graph they load. */
function SidebarGraph() {
  const [graph, setGraph] = useState<GraphData>(EMPTY_GRAPH);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const text2cypher = useText2Cypher((envelope) => setGraph(graphFromEnvelope(envelope)));

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
      <SidebarQuestionInput
        stage={text2cypher.stage}
        error={text2cypher.error}
        onSubmit={(question) => void text2cypher.submit(question)}
      />
      <SidebarRowsPreview cypher={text2cypher.cypher} envelope={text2cypher.envelope} />
      <SidebarShowAllButton onClick={() => void runStatement(SHOW_ALL_QUERY)} disabled={running} />
      <SidebarAccordion onSelectNode={(nodeId) => void runStatement(nodeWithRelationsQuery(nodeId))} />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <SidebarGraphCanvas graph={graph} />
    </div>
  );
}

export { SidebarGraph };
