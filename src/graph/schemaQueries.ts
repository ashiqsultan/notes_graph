/** Lists every label that appears on a node. */
export const LABELS_QUERY = "MATCH (n) UNWIND labels(n) AS label RETURN DISTINCT label ORDER BY label";

/** Lists every relationship type that appears in the graph. */
export const RELATIONSHIP_TYPES_QUERY =
  "MATCH ()-[r]->() RETURN DISTINCT type(r) AS relationshipType ORDER BY relationshipType";
