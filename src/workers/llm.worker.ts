/// <reference lib="webworker" />

import type { ProgressInfo } from "@huggingface/transformers";
import type { WorkerRequest, WorkerResponse } from "@/lib/llmMessages";
import { generateReply, loadTextGenerator } from "@/workers/textGenerator";

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
  try {
    const generator = await loadTextGenerator(forwardProgress);
    if (request.type === "load") {
      postResponse({ type: "ready" });
      return;
    }
    const text = await generateReply(generator, request.prompt);
    postResponse({ type: "reply", text });
  } catch (error) {
    postResponse({ type: "error", message: errorMessage(error) });
  }
}

self.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  void handleRequest(event.data);
});
