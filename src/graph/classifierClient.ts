// Main-thread client for the classifier worker. Each call resolves with the
// type the worker chose, or the fallback type if the worker crashed.
import type {
  ClassifierLoadResponse,
  ClassifierRequest,
  ClassifierResponse,
} from "@/graph/classifierMessages";
import { FALLBACK_NODE_TYPE, type NodeTypeDefinition } from "@/graph/nodeTypes";

type PendingClassification = (type: string) => void;
type LoadListener = (response: ClassifierLoadResponse) => void;

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, PendingClassification>();
let loadListener: LoadListener | null = null;

function createWorker(): Worker {
  const created = new Worker(new URL("../workers/classifier.worker.ts", import.meta.url), {
    type: "module",
  });
  created.onmessage = (event: MessageEvent<ClassifierResponse>) => handleResponse(event.data);
  created.onerror = () => restartWorker();
  return created;
}

function getWorker(): Worker {
  worker ??= createWorker();
  return worker;
}

function postRequest(request: ClassifierRequest): void {
  getWorker().postMessage(request);
}

function handleResponse(response: ClassifierResponse): void {
  if (response.type === "classified") {
    settleClassification(response.id, response.nodeType);
    return;
  }
  loadListener?.(response);
}

function settleClassification(id: number, nodeType: string): void {
  const resolve = pending.get(id);
  pending.delete(id);
  resolve?.(nodeType);
}

/** Ends the worker and resolves every waiting word with the fallback type. */
function restartWorker(): void {
  worker?.terminate();
  worker = null;
  loadListener?.({ type: "error", message: "The classifier worker stopped unexpectedly." });
  for (const resolve of pending.values()) resolve(FALLBACK_NODE_TYPE);
  pending.clear();
}

/** Starts loading the classifier model and reports its progress and outcome to the listener. */
export function preloadClassifier(listener: LoadListener): void {
  loadListener = listener;
  postRequest({ type: "load" });
}

/** Returns the type of a word, judged by the sentence it appears in. */
export function classifyText(
  word: string,
  sentence: string,
  nodeTypes: NodeTypeDefinition[],
): Promise<string> {
  return new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    postRequest({ type: "classify", id, word, sentence, nodeTypes });
  });
}
