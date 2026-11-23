import { quote } from "@/graph/noteGraphCypher";

export const SHOW_ALL_QUERY = "MATCH (n) OPTIONAL MATCH (n)-[r]-(m) RETURN n, r, m";

/** Returns each distinct node type: an entity's type, or the label of any other node. */
export const NODE_TYPES_QUERY = [
  "MATCH (n)",
  "RETURN DISTINCT coalesce(n.type, labels(n)[0]) AS type",
  "ORDER BY type",
].join("\n");

/** Returns one node by its id, together with every relationship it has to its direct neighbours. */
export function nodeConnectionsQuery(nodeId: number): string {
  return [
    "MATCH (n)",
    `WHERE id(n) = ${nodeId}`,
    "OPTIONAL MATCH (n)-[r]-(m)",
    "RETURN n, r, m",
  ].join("\n");
}

const SEARCHED_PROPERTIES = ["name", "key", "type"];

/** Returns the nodes whose name, key or type contains any word of the text, or null when the text is blank. */
export function nodeSearchQuery(text: string): string | null {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  const conditions = words.flatMap((word) =>
    SEARCHED_PROPERTIES.map((property) => containsCondition(property, word))
  );
  return [
    "MATCH (n)",
    `WHERE ${conditions.join(" OR ")}`,
    "OPTIONAL MATCH (n)-[r]-(m)",
    "RETURN n, r, m",
  ].join("\n");
}

function containsCondition(property: string, word: string): string {
  return `toLower(coalesce(n.${property}, '')) CONTAINS toLower(${quote(word)})`;
}

/** Returns every node of one type, together with every relationship each one has. */
export function nodesOfTypeQuery(type: string): string {
  return [
    "MATCH (n)",
    `WHERE coalesce(n.type, labels(n)[0]) = ${quote(type)}`,
    "OPTIONAL MATCH (n)-[r]-(m)",
    "RETURN n, r, m",
  ].join("\n");
}
