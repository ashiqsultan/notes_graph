import type { ExtractedGraph, GraphEntity, GraphRelation } from "@/graph/parseExtraction";

/**
 * Builds one Cypher statement that merges every entity and relation of a note.
 * Elements shared with other notes are matched, and the note id is added to
 * their `note_ids`. Returns null when there is nothing to write.
 */
export function buildMergeCypher(graph: ExtractedGraph, noteId: number): string | null {
  if (graph.entities.length === 0) return null;

  const entityClauses = graph.entities.map((entity) => mergeEntityClause(entity, noteId));
  const relationClauses = graph.relations.map((relation, index) =>
    mergeRelationClause(relation, `r${index}`, noteId),
  );
  return [...entityClauses, ...relationClauses].join("\n");
}

function mergeEntityClause(entity: GraphEntity, noteId: number): string {
  const { id, key, label, name } = entity;
  return [
    `MERGE (${id}:${label} {key: ${quote(key)}})`,
    `  ON CREATE SET ${id}.name = ${quote(name)}, ${id}.note_ids = [${noteId}]`,
    `  ON MATCH SET ${addNoteIdAssignment(id, noteId)}`,
  ].join("\n");
}

function mergeRelationClause(relation: GraphRelation, variable: string, noteId: number): string {
  return [
    `MERGE (${relation.from})-[${variable}:${relation.type}]->(${relation.to})`,
    `  ON CREATE SET ${variable}.note_ids = [${noteId}]`,
    `  ON MATCH SET ${addNoteIdAssignment(variable, noteId)}`,
  ].join("\n");
}

/** Appends the note id to `note_ids` without adding it twice. */
function addNoteIdAssignment(variable: string, noteId: number): string {
  const others = `[id IN coalesce(${variable}.note_ids, []) WHERE id <> ${noteId}]`;
  return `${variable}.note_ids = ${others} + [${noteId}]`;
}

function quote(value: string): string {
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
  return `'${escaped}'`;
}
