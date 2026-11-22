/** Messages the main thread sends to the LLM worker. */
export type WorkerRequest =
  | { type: "load" }
  | { type: "generate"; id: number; prompt: string; system?: string };

/** Messages the LLM worker sends back to the main thread. */
export type WorkerResponse =
  | { type: "progress"; file: string; percent: number }
  | { type: "ready" }
  | { type: "reply"; id: number; text: string }
  | { type: "error"; id?: number; message: string };
