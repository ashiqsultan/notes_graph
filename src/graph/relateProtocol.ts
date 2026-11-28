// Messages exchanged between the page and the relate worker.

export interface RunRequest {
  id: number;
  kind: "run";
  statement: string;
  params?: Record<string, unknown>;
}

export interface ResetRequest {
  id: number;
  kind: "reset";
}

export type WorkerRequest = RunRequest | ResetRequest;

export interface RunSuccess {
  id: number;
  /** The raw envelope JSON returned by relate; empty after a reset. */
  text: string;
}

export interface RunFailure {
  id: number;
  failed: string;
  /** True when the engine trapped and the worker must be replaced. */
  trap: boolean;
}

export type RunResponse = RunSuccess | RunFailure;

export function isRunFailure(response: RunResponse): response is RunFailure {
  return "failed" in response;
}
