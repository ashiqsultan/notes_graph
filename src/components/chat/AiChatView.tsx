import { PromptForm } from "@/components/chat/PromptForm";
import { useNotesStore } from "@/store";

const UNSUPPORTED_MESSAGE =
  "WebGPU is not supported in this browser. Please use a browser with WebGPU enabled.";

/** Single-turn chat with the in-browser model. Shows only the latest reply. */
function AiChatView() {
  const llm = useNotesStore((state) => state.llm);
  const generateChatReply = useNotesStore((state) => state.generateChatReply);
  const canPrompt = llm.status === "ready" && !llm.generating;

  return (
    <section className="flex flex-col gap-4">
      {llm.status === "unsupported" && (
        <p className="text-sm text-destructive">{UNSUPPORTED_MESSAGE}</p>
      )}
      {llm.error && <p className="text-sm text-destructive">{llm.error}</p>}
      <PromptForm enabled={canPrompt} onSubmit={generateChatReply} />
      <div className="min-h-32 whitespace-pre-wrap rounded-xl border bg-card p-4 text-sm">
        {llm.generating ? "Thinking…" : llm.reply}
      </div>
    </section>
  );
}

export { AiChatView };
