/// <reference lib="webworker" />

import type {
  ClassifierRequest,
  ClassifierResponse,
} from "@/graph/classifierMessages";
import { FALLBACK_NODE_TYPE, type NodeType } from "@/graph/nodeTypes";
import { classifyWord, loadTextClassifier } from "@/workers/textClassifier";

const MODEL_LABEL = "kev-0.6b";

let requestQueue: Promise<void> = Promise.resolve();

function postResponse(response: ClassifierResponse): void {
  self.postMessage(response);
}

function forwardProgress(percent: number): void {
  postResponse({ type: "progress", file: MODEL_LABEL, percent });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function handleLoad(): Promise<void> {
  try {
    await loadTextClassifier(forwardProgress);
    postResponse({ type: "ready" });
  } catch (error) {
    postResponse({ type: "error", message: errorMessage(error) });
  }
}

async function handleClassify(
  request: Extract<ClassifierRequest, { type: "classify" }>,
): Promise<void> {
  const nodeType = await classifySafely(request.word, request.sentence);
  postResponse({ type: "classified", id: request.id, nodeType });
}

async function classifySafely(word: string, sentence: string): Promise<NodeType> {
  try {
    const classifier = await loadTextClassifier();
    return await classifyWord(classifier, word, sentence);
  } catch {
    return FALLBACK_NODE_TYPE;
  }
}

function handleRequest(request: ClassifierRequest): Promise<void> {
  if (request.type === "load") return handleLoad();
  return handleClassify(request);
}

/** Requests run one at a time so the classifier is never called concurrently. */
self.addEventListener("message", (event: MessageEvent<ClassifierRequest>) => {
  requestQueue = requestQueue.then(() => handleRequest(event.data));
});
