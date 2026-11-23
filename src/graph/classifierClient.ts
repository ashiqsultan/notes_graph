// Main-thread client for the classifier worker. Each call resolves with the
// type the worker chose, or the fallback type if the worker crashed.
import type { ClassifyRequest, ClassifyResponse } from "@/graph/classifierMessages";
import { FALLBACK_NODE_TYPE, type NodeType } from "@/graph/nodeTypes";

type PendingClassification = (type: NodeType) => void;

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, PendingClassification>();

function createWorker(): Worker {
  const created = new Worker(new URL("../workers/classifier.worker.ts", import.meta.url), {
    type: "module",
  });
  created.onmessage = (event: MessageEvent<ClassifyResponse>) => handleResponse(event.data);
  created.onerror = () => restartWorker();
  return created;
}

function getWorker(): Worker {
  worker ??= createWorker();
  return worker;
}

function handleResponse(response: ClassifyResponse): void {
  const resolve = pending.get(response.id);
  pending.delete(response.id);
  resolve?.(response.type);
}

/** Ends the worker and resolves every waiting word with the fallback type. */
function restartWorker(): void {
  worker?.terminate();
  worker = null;
  for (const resolve of pending.values()) resolve(FALLBACK_NODE_TYPE);
  pending.clear();
}

/** Returns the type of a word, judged by the sentence it appears in. */
export function classifyText(word: string, sentence: string): Promise<NodeType> {
  return new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    const request: ClassifyRequest = { id, word, sentence };
    getWorker().postMessage(request);
  });
}
