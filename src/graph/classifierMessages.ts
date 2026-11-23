import type { NodeType } from "@/graph/nodeTypes";

/** Messages the main thread sends to the classifier worker. */
export type ClassifierRequest =
  | { type: "load" }
  | { type: "classify"; id: number; word: string; sentence: string };

/** Messages reported while the classifier model loads. */
export type ClassifierLoadResponse =
  | { type: "progress"; file: string; percent: number }
  | { type: "ready" }
  | { type: "error"; message: string };

/** Messages the classifier worker sends back to the main thread. */
export type ClassifierResponse =
  | ClassifierLoadResponse
  | { type: "classified"; id: number; nodeType: NodeType };
