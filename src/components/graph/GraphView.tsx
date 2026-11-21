import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { runCypher } from "@/graph/relateClient";

/** Runs one Cypher statement against relate and shows the raw result. */
function GraphView() {
  const [query, setQuery] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRunning(true);
    try {
      setOutput(await runCypher(query));
    } catch (err) {
      setOutput(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
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
      <div className="whitespace-pre-wrap break-all font-mono text-sm">{output}</div>
    </section>
  );
}

export { GraphView };
