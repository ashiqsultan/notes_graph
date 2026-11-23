/// <reference lib="webworker" />

import type { ClassifyRequest, ClassifyResponse } from "@/graph/classifierMessages";
import { FALLBACK_NODE_TYPE, type NodeType } from "@/graph/nodeTypes";
import { classifyWord, loadTextClassifier } from "@/workers/textClassifier";

let requestQueue: Promise<void> = Promise.resolve();

async function handleRequest(request: ClassifyRequest): Promise<void> {
  const type = await classifySafely(request);
  const response: ClassifyResponse = { id: request.id, type };
  self.postMessage(response);
}

async function classifySafely(request: ClassifyRequest): Promise<NodeType> {
  try {
    const classifier = await loadTextClassifier();
    return await classifyWord(classifier, request.word, request.sentence);
  } catch {
    return FALLBACK_NODE_TYPE;
  }
}

/** Requests run one at a time so the classifier is never called concurrently. */
self.addEventListener("message", (event: MessageEvent<ClassifyRequest>) => {
  requestQueue = requestQueue.then(() => handleRequest(event.data));
});
