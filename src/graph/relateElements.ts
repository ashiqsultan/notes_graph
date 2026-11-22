// Node and relationship values relate returns inside result rows, and their
// conversion to the elements NVL draws.
import type { Node, Relationship } from "@neo4j-nvl/base";

export interface GraphData {
  nodes: Node[];
  rels: Relationship[];
}

export const EMPTY_GRAPH: GraphData = { nodes: [], rels: [] };

export interface RelateNode {
  id: number;
  kind: "node";
  labels: string[];
  properties: Record<string, unknown>;
}

export interface RelateRelationship {
  id: number;
  kind: "relationship";
  type: string;
  start_node: number;
  end_node: number;
  properties: Record<string, unknown>;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isRelateNode(value: unknown): value is RelateNode {
  return isRecord(value) && value.kind === "node";
}

export function isRelateRelationship(value: unknown): value is RelateRelationship {
  return isRecord(value) && value.kind === "relationship";
}

export function toNvlNode(node: RelateNode): Node {
  return { id: String(node.id), caption: nodeCaption(node) };
}

export function toNvlRelationship(rel: RelateRelationship): Relationship {
  return {
    id: String(rel.id),
    from: String(rel.start_node),
    to: String(rel.end_node),
    caption: rel.type,
  };
}

function nodeCaption(node: RelateNode): string {
  const name = node.properties.name ?? node.properties.title;
  if (typeof name === "string") return name;
  return node.labels[0] ?? String(node.id);
}
