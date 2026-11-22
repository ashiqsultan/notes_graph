import { ModelDownloadDialog } from "@/components/chat/ModelDownloadDialog";
import { PromptForm } from "@/components/chat/PromptForm";
import { useLlm } from "@/components/chat/useLlm";

const UNSUPPORTED_MESSAGE =
  "WebGPU is not supported in this browser. Please use a browser with WebGPU enabled.";

/** Single-turn chat with the in-browser model. Shows only the latest reply. */
function AiChatView() {
  const llm = useLlm();
  const canPrompt = llm.status === "ready" && !llm.generating;

  return (
    <section className="flex flex-col gap-4">
      <ModelDownloadDialog open={llm.status === "loading"} progress={llm.progress} />
      {llm.status === "unsupported" && (
        <p className="text-sm text-destructive">{UNSUPPORTED_MESSAGE}</p>
      )}
      {llm.error && <p className="text-sm text-destructive">{llm.error}</p>}
      <PromptForm enabled={canPrompt} onSubmit={llm.generate} />
      <div className="min-h-32 whitespace-pre-wrap rounded-xl border bg-card p-4 text-sm">
        {llm.generating ? "Thinking…" : llm.reply}
      </div>
    </section>
  );
}

export { AiChatView };
