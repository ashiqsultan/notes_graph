import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResetGraphButton } from "@/components/graph/ResetGraphButton";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { runCypher } from "@/graph/relateClient";
import { graphFromEnvelope } from "@/graph/graphFromEnvelope";
import { EMPTY_GRAPH, type GraphData } from "@/graph/relateElements";

const SHOW_ALL_QUERY = "MATCH (n) OPTIONAL MATCH (n)-[r]-(m) RETURN n, r, m";

/** Runs one Cypher statement against relate, shows the raw result and draws its graph. */
function GraphView() {
  const [query, setQuery] = useState("");
  const [output, setOutput] = useState("");
  const [graph, setGraph] = useState<GraphData>(EMPTY_GRAPH);
  const [running, setRunning] = useState(false);

  async function runStatement(statement: string) {
    setRunning(true);
    try {
      const text = await runCypher(statement);
      setOutput(text);
      setGraph(graphFromEnvelope(text));
    } catch (err) {
      setOutput(err instanceof Error ? err.message : String(err));
      setGraph(EMPTY_GRAPH);
    } finally {
      setRunning(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runStatement(query);
  }

  function handleShowAll() {
    setQuery(SHOW_ALL_QUERY);
    void runStatement(SHOW_ALL_QUERY);
  }

  return (
    <section className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="MATCH (n) RETURN n"
          aria-label="Cypher query"
        />
        <Button type="submit" disabled={running || !query.trim()}>
          {running ? "Running…" : "Run"}
        </Button>
      </form>
      <Button type="button" variant="outline" className="self-start" onClick={handleShowAll} disabled={running}>
        Show all
      </Button>
      <div className="max-w-2.5">
      {import.meta.env.DEV && (
        <ResetGraphButton
          onReset={() => {
            setOutput("");
            setGraph(EMPTY_GRAPH);
          }}
        />
      )}
      </div>
      <div className="whitespace-pre-wrap break-all font-mono text-sm">{output}</div>
      <GraphCanvas graph={graph} />
    </section>
  );
}

export { GraphView };
