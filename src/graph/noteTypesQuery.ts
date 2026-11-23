/** Returns each note's key with the distinct types of the entities linked to it. */
export const NOTE_TYPES_QUERY = [
  "MATCH (e:Entity)-[:MENTIONED_IN]->(n:Note)",
  "RETURN n.key AS noteId, collect(DISTINCT e.type) AS types",
].join("\n");
