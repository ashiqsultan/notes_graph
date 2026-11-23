import type { KeyboardEvent } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CypherQueryFormProps {
  value: string;
  running: boolean;
  onChange: (value: string) => void;
  onRun: (query: string) => void;
}

/** A multi-line Cypher editor. Cmd/Ctrl+Enter or the Run button sends the query. */
function CypherQueryForm({ value, running, onChange, onRun }: CypherQueryFormProps) {
  const canRun = !running && value.trim() !== "";

  function submit() {
    if (canRun) onRun(value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    submit();
  }

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Textarea
        aria-label="Cypher query"
        placeholder={"MATCH (n)-[r]-(m)\nRETURN n, r, m"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className="max-h-48 font-mono"
      />
      <Button type="submit" size="sm" disabled={!canRun}>
        <Play />
        Run
      </Button>
    </form>
  );
}

export { CypherQueryForm };
