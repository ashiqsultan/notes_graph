/// <reference lib="webworker" />

import type { ProgressInfo } from "@huggingface/transformers";
import type { WorkerRequest, WorkerResponse } from "@/lib/llmMessages";
import { generateReply, loadTextGenerator } from "@/workers/textGenerator";

let requestQueue: Promise<void> = Promise.resolve();

function postResponse(response: WorkerResponse) {
  self.postMessage(response);
}

function forwardProgress(info: ProgressInfo) {
  if (info.status !== "progress") return;
  postResponse({ type: "progress", file: info.file, percent: info.progress });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function handleRequest(request: WorkerRequest) {
  const id = request.type === "generate" ? request.id : undefined;
  try {
    const generator = await loadTextGenerator(forwardProgress);
    if (request.type === "load") {
      postResponse({ type: "ready" });
      return;
    }
    const text = await generateReply(generator, request.prompt, request.system);
    postResponse({ type: "reply", id: request.id, text });
  } catch (error) {
    postResponse({ type: "error", id, message: errorMessage(error) });
  }
}

/** Requests run one at a time so concurrent prompts never share the pipeline. */
function enqueueRequest(request: WorkerRequest) {
  requestQueue = requestQueue.then(() => handleRequest(request));
}

self.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  enqueueRequest(event.data);
});
