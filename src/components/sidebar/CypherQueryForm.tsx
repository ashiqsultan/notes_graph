import type { KeyboardEvent } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GraphSearchInput } from "@/components/sidebar/GraphSearchInput";

interface CypherQueryFormProps {
  value: string;
  running: boolean;
  searchText: string;
  onSearchChange: (value: string) => void;
  onChange: (value: string) => void;
  onRun: (query: string) => void;
}

/** A search box, then a multi-line Cypher editor. Cmd/Ctrl+Enter or the Run button sends the query. */
function CypherQueryForm({
  value,
  running,
  searchText,
  onSearchChange,
  onChange,
  onRun,
}: CypherQueryFormProps) {
  const canRun = !running && value.trim() !== "";

  function submit() {
    if (canRun) onRun(value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    submit();
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") event.preventDefault();
  }

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <GraphSearchInput
        value={searchText}
        onChange={onSearchChange}
        onKeyDown={handleSearchKeyDown}
      />
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
