// Main-thread client for the relate worker. Each call resolves with the raw
// envelope text relate returned for the statement.
import {
  isRunFailure,
  type RunRequest,
  type RunResponse,
} from "./relateProtocol";

interface PendingRun {
  resolve: (text: string) => void;
  reject: (err: Error) => void;
}

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, PendingRun>();

function createWorker(): Worker {
  const created = new Worker(new URL("./relate.worker.ts", import.meta.url), {
    type: "module",
  });
  created.onmessage = (event: MessageEvent<RunResponse>) => handleResponse(event.data);
  created.onerror = (event) => {
    restartWorker(new Error(event.message || "relate worker crashed"));
  };
  return created;
}

function getWorker(): Worker {
  worker ??= createWorker();
  return worker;
}

function handleResponse(response: RunResponse): void {
  const run = pending.get(response.id);
  pending.delete(response.id);
  if (!run) return;
  if (!isRunFailure(response)) {
    run.resolve(response.text);
    return;
  }
  if (response.trap) restartWorker(new Error(response.failed));
  run.reject(new Error(response.failed));
}

/** Ends the worker, which releases the OPFS store, and fails every waiting run. */
function restartWorker(reason: Error): void {
  worker?.terminate();
  worker = null;
  for (const run of pending.values()) run.reject(reason);
  pending.clear();
}

export function runCypher(statement: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    const request: RunRequest = { id, statement };
    getWorker().postMessage(request);
  });
}
