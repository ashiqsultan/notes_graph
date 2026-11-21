// Messages exchanged between the page and the relate worker.

export interface RunRequest {
  id: number;
  statement: string;
}

export interface RunSuccess {
  id: number;
  /** The raw envelope JSON returned by relate. */
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
