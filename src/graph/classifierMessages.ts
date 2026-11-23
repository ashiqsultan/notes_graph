import type { NodeType } from "@/graph/nodeTypes";

export interface ClassifyRequest {
  id: number;
  word: string;
  sentence: string;
}

export interface ClassifyResponse {
  id: number;
  type: NodeType;
}
