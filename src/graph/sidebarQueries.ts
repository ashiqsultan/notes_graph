export const SHOW_ALL_QUERY = "MATCH (n) OPTIONAL MATCH (n)-[r]-(m) RETURN n, r, m";
export const ALL_NODES_QUERY = "MATCH (n) RETURN n";

/** Returns a node together with every relationship it has. */
export function nodeWithRelationsQuery(nodeId: string): string {
  return `MATCH (n) WHERE id(n) = ${toIntegerId(nodeId)} OPTIONAL MATCH (n)-[r]-(m) RETURN n, r, m`;
}

function toIntegerId(id: string): number {
  if (!/^\d+$/.test(id)) throw new Error(`Invalid id: ${id}`);
  return Number(id);
}
