import type { WorkerRequest, WorkerResponse } from "@/lib/llmMessages";

interface PendingGeneration {
  resolve: (text: string) => void;
  reject: (error: Error) => void;
}

let worker: Worker | null = null;
let nextRequestId = 0;
const pendingGenerations = new Map<number, PendingGeneration>();

/** Returns the single LLM worker, creating it on first use. */
export function getLlmWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("../workers/llm.worker.ts", import.meta.url), {
    type: "module",
  });
  worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
    settleGeneration(event.data);
  });
  return worker;
}

/** Sends a request to the LLM worker. */
export function postLlmRequest(request: WorkerRequest) {
  getLlmWorker().postMessage(request);
}

/** Runs one single-turn prompt and resolves with the model's reply. */
export function generateText(prompt: string, system?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const id = nextRequestId++;
    pendingGenerations.set(id, { resolve, reject });
    postLlmRequest({ type: "generate", id, prompt, system });
  });
}

function settleGeneration(response: WorkerResponse) {
  if (response.type !== "reply" && response.type !== "error") return;
  if (response.id === undefined) return;

  const pending = pendingGenerations.get(response.id);
  pendingGenerations.delete(response.id);
  if (!pending) return;

  if (response.type === "reply") pending.resolve(response.text);
  else pending.reject(new Error(response.message));
}

/** WebGPU is exposed as `navigator.gpu` only in supporting browsers. */
export function isWebGpuAvailable(): boolean {
  return "gpu" in navigator;
}
