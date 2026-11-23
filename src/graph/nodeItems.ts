import { isRecord, isRelateNode, type RelateNode } from "@/graph/relateElements";

/** Returns the unique Entity nodes found in the `n` and `m` columns of result rows. */
export function entityItemsFromRows(rows: unknown[]): RelateNode[] {
  const entities = new Map<number, RelateNode>();
  for (const row of rows) {
    for (const node of rowNodes(row)) {
      if (isEntity(node)) entities.set(node.id, node);
    }
  }
  return [...entities.values()];
}

function rowNodes(row: unknown): RelateNode[] {
  if (!isRecord(row)) return [];
  return [row.n, row.m].filter(isRelateNode);
}

function isEntity(node: RelateNode): boolean {
  return node.labels.includes("Entity");
}

/** Returns the name shown for a node item, falling back to its id. */
export function entityName(node: RelateNode): string {
  const name = node.properties.name;
  return typeof name === "string" ? name : String(node.id);
}

/** Returns the type shown for a node item, such as Technology. */
export function entityType(node: RelateNode): string {
  const type = node.properties.type;
  return typeof type === "string" ? type : "Entity";
}
