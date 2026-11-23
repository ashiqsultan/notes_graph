import { quote } from "@/graph/noteGraphCypher";

export const SHOW_ALL_QUERY = "MATCH (n) OPTIONAL MATCH (n)-[r]-(m) RETURN n, r, m";

/** Returns each distinct node type: an entity's type, or the label of any other node. */
export const NODE_TYPES_QUERY = [
  "MATCH (n)",
  "RETURN DISTINCT coalesce(n.type, labels(n)[0]) AS type",
  "ORDER BY type",
].join("\n");

/** Returns every node of one type, together with every relationship each one has. */
export function nodesOfTypeQuery(type: string): string {
  return [
    "MATCH (n)",
    `WHERE coalesce(n.type, labels(n)[0]) = ${quote(type)}`,
    "OPTIONAL MATCH (n)-[r]-(m)",
    "RETURN n, r, m",
  ].join("\n");
}
