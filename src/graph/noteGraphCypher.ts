import type { NoteWord } from "@/graph/getWords";

/** Reads the key of every word the note is linked to. */
export function linkedKeysQuery(noteId: number): string {
  return [
    "MATCH (e:Entity)-[:MENTIONED_IN]->(n:Note)",
    `WHERE n.key = ${quote(String(noteId))}`,
    "RETURN e.key AS key",
  ].join("\n");
}

/** Creates or renames the note, then links each new word to it. */
export function upsertNoteStatement(noteId: number, title: string, words: NoteWord[]): string {
  return [
    `MERGE (n:Note {key: ${quote(String(noteId))}})`,
    `  SET n.name = ${quote(title)}`,
    ...words.flatMap((word, index) => linkWordClauses(word, `e${index}`)),
  ].join("\n");
}

function linkWordClauses(word: NoteWord, variable: string): string[] {
  return [
    `MERGE (${variable}:Entity {key: ${quote(word.key)}})`,
    `  ON CREATE SET ${variable}.name = ${quote(word.name)}, ${variable}.type = ${quote(word.type)}`,
    `MERGE (${variable})-[:MENTIONED_IN]->(n)`,
  ];
}

/** Unlinks the note from the given words. */
export function removeLinksStatement(noteId: number, keys: string[]): string {
  return [
    "MATCH (e:Entity)-[r:MENTIONED_IN]->(n:Note)",
    `WHERE n.key = ${quote(String(noteId))} AND e.key IN ${quoteList(keys)}`,
    "DELETE r",
  ].join("\n");
}

/** Deletes the note and all of its links. */
export function deleteNoteStatement(noteId: number): string {
  return `MATCH (n:Note {key: ${quote(String(noteId))}}) DETACH DELETE n`;
}

/** Gives every entity of the old type the new type. */
export function setEntityTypeStatement(oldType: string, newType: string): string {
  return [
    `MATCH (e:Entity {type: ${quote(oldType)}})`,
    `SET e.type = ${quote(newType)}`,
  ].join("\n");
}

/** Deletes the given words that no note mentions any more. */
export function removeOrphansStatement(keys: string[]): string {
  return [
    `MATCH (e:Entity) WHERE e.key IN ${quoteList(keys)}`,
    "OPTIONAL MATCH (e)-[r:MENTIONED_IN]->()",
    "WITH e, count(r) AS mentions",
    "WHERE mentions = 0",
    "DELETE e",
  ].join("\n");
}

function quoteList(values: string[]): string {
  return `[${values.map(quote).join(", ")}]`;
}

export function quote(value: string): string {
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
  return `'${escaped}'`;
}
