import type { WorkerRequest } from "@/lib/llmMessages";

let worker: Worker | null = null;

/** Returns the single LLM worker, creating it on first use. */
export function getLlmWorker(): Worker {
  worker ??= new Worker(new URL("../workers/llm.worker.ts", import.meta.url), {
    type: "module",
  });
  return worker;
}

/** Sends a request to the LLM worker. */
export function postLlmRequest(request: WorkerRequest) {
  getLlmWorker().postMessage(request);
}

/** WebGPU is exposed as `navigator.gpu` only in supporting browsers. */
export function isWebGpuAvailable(): boolean {
  return "gpu" in navigator;
}
