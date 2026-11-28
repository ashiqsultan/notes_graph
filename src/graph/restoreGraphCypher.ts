// Statements that write a backup's nodes and relationships. Rows arrive as
// the $rows parameter; labels and types must be literal in Cypher, so they are quoted here.

/** Creates one node per row with the given labels, and returns each file id with its new id. */
export function createNodesStatement(labels: string[]): string {
  return [
    "UNWIND $rows AS row",
    `CREATE (n${labels.map((label) => `:${quoteName(label)}`).join("")})`,
    "SET n = row.properties",
    "RETURN row.fileId AS fileId, id(n) AS newId",
  ].join("\n");
}

/** Creates one relationship of the given type per row, between the new ids of its endpoints. */
export function createRelationshipsStatement(type: string): string {
  return [
    "UNWIND $rows AS row",
    "MATCH (a) WHERE id(a) = row.start",
    "MATCH (b) WHERE id(b) = row.end",
    `CREATE (a)-[r:${quoteName(type)}]->(b)`,
    "SET r = row.properties",
  ].join("\n");
}

function quoteName(name: string): string {
  return `\`${name.replace(/`/g, "``")}\``;
}
