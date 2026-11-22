/** Messages the main thread sends to the LLM worker. */
export type WorkerRequest =
  | { type: "load" }
  | { type: "generate"; prompt: string };

/** Messages the LLM worker sends back to the main thread. */
export type WorkerResponse =
  | { type: "progress"; file: string; percent: number }
  | { type: "ready" }
  | { type: "reply"; text: string }
  | { type: "error"; message: string };
