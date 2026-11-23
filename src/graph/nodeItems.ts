import { isRecord, isRelateNode, type RelateNode } from "@/graph/relateElements";

const LISTABLE_LABELS = ["Entity", "Note"];

/** Returns the unique Entity and Note nodes found in the `n` and `m` columns of result rows. */
export function listableNodesFromRows(rows: unknown[]): RelateNode[] {
  const nodes = new Map<number, RelateNode>();
  for (const row of rows) {
    for (const node of rowNodes(row)) {
      if (isListableNode(node)) nodes.set(node.id, node);
    }
  }
  return [...nodes.values()];
}

function rowNodes(row: unknown): RelateNode[] {
  if (!isRecord(row)) return [];
  return [row.n, row.m].filter(isRelateNode);
}

function isListableNode(node: RelateNode): boolean {
  return node.labels.some((label) => LISTABLE_LABELS.includes(label));
}

/** Returns the name shown for a node item, falling back to its id. */
export function nodeName(node: RelateNode): string {
  const name = node.properties.name;
  return typeof name === "string" ? name : String(node.id);
}

/** Returns the type shown for a node item, such as Technology or Note. */
export function nodeType(node: RelateNode): string {
  const type = node.properties.type;
  return typeof type === "string" ? type : (node.labels[0] ?? "Node");
}
