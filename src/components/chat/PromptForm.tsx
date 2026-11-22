import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PromptFormProps {
  enabled: boolean;
  onSubmit: (prompt: string) => void;
}

/** Single-line prompt input. Clears itself after each submit. */
function PromptForm({ enabled, onSubmit }: PromptFormProps) {
  const [prompt, setPrompt] = useState("");
  const canSubmit = enabled && prompt.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(prompt.trim());
    setPrompt("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Ask a question…"
        aria-label="Prompt"
        disabled={!enabled}
      />
      <Button type="submit" disabled={!canSubmit}>
        Send
      </Button>
    </form>
  );
}

export { PromptForm };
