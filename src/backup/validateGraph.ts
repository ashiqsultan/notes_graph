import type { GraphElements } from "@/graph/readGraphElements";
import { isRecord, type RelateNode, type RelateRelationship } from "@/graph/relateElements";

/** Checks the graph part of a backup for format only. Throws with the first problem found. */
export function validateGraph(value: unknown): GraphElements {
  if (!isRecord(value)) throw new Error("graph must be an object");
  const nodes = requireList(value.nodes, "graph.nodes").map(requireNode);
  const relationships = requireList(value.relationships, "graph.relationships").map(
    requireRelationship
  );
  requireKnownEndpoints(nodes, relationships);
  return { nodes, relationships };
}

function requireList(value: unknown, name: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${name} must be a list`);
  return value;
}

function requireNode(value: unknown): RelateNode {
  if (!isNodeShape(value)) throw new Error("graph.nodes contains an invalid node");
  return value;
}

function requireRelationship(value: unknown): RelateRelationship {
  if (!isRelationshipShape(value)) throw new Error("graph.relationships contains an invalid relationship");
  return value;
}

function isNodeShape(value: unknown): value is RelateNode {
  return (
    isRecord(value) &&
    value.kind === "node" &&
    isId(value.id) &&
    isNameList(value.labels) &&
    isRecord(value.properties)
  );
}

function isRelationshipShape(value: unknown): value is RelateRelationship {
  return (
    isRecord(value) &&
    value.kind === "relationship" &&
    isId(value.id) &&
    isName(value.type) &&
    isId(value.start_node) &&
    isId(value.end_node) &&
    isRecord(value.properties)
  );
}

function isId(value: unknown): value is number {
  return Number.isInteger(value);
}

function isName(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isNameList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isName);
}

function requireKnownEndpoints(nodes: RelateNode[], relationships: RelateRelationship[]): void {
  const nodeIds = new Set(nodes.map((node) => node.id));
  if (nodeIds.size !== nodes.length) throw new Error("graph.nodes contains a repeated id");
  for (const rel of relationships) {
    if (!nodeIds.has(rel.start_node) || !nodeIds.has(rel.end_node)) {
      throw new Error(`relationship ${rel.id} points to a node that is not in the file`);
    }
  }
}
