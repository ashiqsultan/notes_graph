// Reads a relate result envelope and builds the graph held in its rows.
import {
  EMPTY_GRAPH,
  isRecord,
  isRelateNode,
  isRelateRelationship,
  toNvlNode,
  toNvlRelationship,
  type GraphData,
  type RelateNode,
  type RelateRelationship,
} from "@/graph/relateElements";

/** Returns the nodes and relationships found in the rows of an envelope. */
export function graphFromEnvelope(text: string): GraphData {
  const rows = readRows(text);
  if (rows.length === 0) return EMPTY_GRAPH;
  return buildGraph(rows.flatMap(collectElements));
}

function readRows(text: string): unknown[] {
  const envelope = parseJson(text);
  if (!isRecord(envelope) || envelope.error) return [];
  return Array.isArray(envelope.rows) ? envelope.rows : [];
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Finds every node and relationship inside a value, including lists and paths. */
export function collectElements(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap(collectElements);
  if (!isRecord(value)) return [];
  if (isRelateNode(value) || isRelateRelationship(value)) return [value];
  return Object.values(value).flatMap(collectElements);
}

function buildGraph(elements: unknown[]): GraphData {
  const nodes = new Map<number, RelateNode>();
  const rels = new Map<number, RelateRelationship>();
  for (const element of elements) {
    if (isRelateNode(element)) nodes.set(element.id, element);
    else if (isRelateRelationship(element)) rels.set(element.id, element);
  }
  return {
    nodes: [...nodes.values()].map(toNvlNode),
    rels: [...rels.values()].filter((rel) => hasEndpoints(nodes, rel)).map(toNvlRelationship),
  };
}

/** Drops relationships whose start or end node is missing from the result. */
function hasEndpoints(nodes: Map<number, RelateNode>, rel: RelateRelationship): boolean {
  return nodes.has(rel.start_node) && nodes.has(rel.end_node);
}
