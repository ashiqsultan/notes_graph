import { runCypher } from "@/graph/relateClient";

/**
 * Removes a note from the graph. The note id is taken out of every `note_ids`
 * list, then elements that no other note uses are deleted. Relationships go
 * first so nodes can be deleted without detaching other notes' relationships.
 */
export async function deleteNoteGraph(noteId: number): Promise<void> {
  for (const statement of buildDeleteStatements(noteId)) {
    await runCypher(statement);
  }
}

function buildDeleteStatements(noteId: number): string[] {
  return [
    `MATCH ()-[r]->() WHERE ${noteId} IN r.note_ids SET r.note_ids = [id IN r.note_ids WHERE id <> ${noteId}]`,
    "MATCH ()-[r]->() WHERE size(r.note_ids) = 0 DELETE r",
    `MATCH (n) WHERE ${noteId} IN n.note_ids SET n.note_ids = [id IN n.note_ids WHERE id <> ${noteId}]`,
    "MATCH (n) WHERE size(n.note_ids) = 0 DETACH DELETE n",
  ];
}
