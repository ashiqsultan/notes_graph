import { useEffect, useState } from "react";
import {
  getLlmWorker,
  isWebGpuAvailable,
  postLlmRequest,
} from "@/lib/llm";
import type { WorkerResponse } from "@/lib/llmMessages";
import {
  createInitialLlmState,
  reduceWorkerResponse,
  startGenerating,
  type LlmState,
} from "@/lib/llmState";

/** Loads the model when mounted and exposes single-turn prompt generation. */
function useLlm() {
  const [state, setState] = useState<LlmState>(() =>
    createInitialLlmState(isWebGpuAvailable()),
  );

  useEffect(() => {
    if (!isWebGpuAvailable()) return;

    const worker = getLlmWorker();
    const onMessage = (event: MessageEvent<WorkerResponse>) => {
      setState((prev) => reduceWorkerResponse(prev, event.data));
    };

    worker.addEventListener("message", onMessage);
    postLlmRequest({ type: "load" });
    return () => worker.removeEventListener("message", onMessage);
  }, []);

  function generate(prompt: string) {
    setState(startGenerating);
    postLlmRequest({ type: "generate", prompt });
  }

  return { ...state, generate };
}

export { useLlm };
