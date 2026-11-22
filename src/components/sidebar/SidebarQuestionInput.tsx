import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarQuestionProgress } from "@/components/sidebar/SidebarQuestionProgress";
import type { Text2CypherStage } from "@/graph/text2CypherStages";

interface SidebarQuestionInputProps {
  stage: Text2CypherStage | null;
  error: string;
  onSubmit: (question: string) => void;
}

/** Text box that takes a question about the graph and shows its progress. */
function SidebarQuestionInput({ stage, error, onSubmit }: SidebarQuestionInputProps) {
  const [question, setQuestion] = useState("");
  const running = stage !== null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || running) return;
    onSubmit(trimmed);
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <Input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask a question about your graph"
          disabled={running}
        />
        <Button type="submit" disabled={running || !question.trim()}>
          Ask
        </Button>
      </div>
      {stage && <SidebarQuestionProgress stage={stage} />}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}

export { SidebarQuestionInput };
