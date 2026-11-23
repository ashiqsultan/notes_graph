import type { GraphSchema } from "@/graph/readSchema";

const RULES = [
  "You write read-only Neo4j Cypher queries for a graph of notes.",
  'Reply with a JSON object only, in exactly this format: {"cypher_query": "<cypher query here>"}',
  "Put the whole Cypher query as one string in cypher_query.",
  "No explanation, no markdown, no code fences.",
  "",
  "Graph shape:",
  "- Note: one per note. name = the note's title.",
  "- Entity: a word or phrase taken from the notes. name = how it reads, key = lowercase form.",
  "- The only relationship is MENTIONED_IN, always from an Entity to a Note.",
  "",
  "Rules:",
  "- Match an entity by key (exact, lowercase), e.g. e.key = 'alpha'.",
  "- Match notes or names loosely with toLower(n.name) CONTAINS 'text'.",
  "- Return the matched nodes and relationships (RETURN e, r, n) so they can be drawn.",
  "- For counts or rankings, return the aggregated columns instead.",
  "- Add LIMIT 50 to broad queries.",
  "- Use only MATCH, WHERE, WITH, RETURN, ORDER BY, LIMIT and count. Never write data or call procedures.",
];

const EXAMPLES = [
  "Question: Which notes mention alpha?",
  '{"cypher_query": "MATCH (e:Entity {key: \'alpha\'})-[r:MENTIONED_IN]->(n:Note) RETURN e, r, n"}',
  "",
  "Question: Which notes share words with the note Trip plan?",
  '{"cypher_query": "MATCH (t:Note)<-[:MENTIONED_IN]-(e:Entity)-[r:MENTIONED_IN]->(m:Note) WHERE toLower(t.name) CONTAINS \'trip plan\' AND m <> t RETURN e, r, m LIMIT 50"}',
  "",
  "Question: Which words appear in the most notes?",
  '{"cypher_query": "MATCH (e:Entity)-[:MENTIONED_IN]->(n:Note) RETURN e.name AS word, count(n) AS notes ORDER BY notes DESC LIMIT 10"}',
];

const OUTPUT_INSTRUCTIONS = [
  "The output MUST be a valid JSON with a single property cypher_query",
  "FORMAT {cypher_query: <cypher query here>}",
];

/** Builds the system prompt with the graph's labels and relationship types. */
export function buildSystemPrompt(schema: GraphSchema): string {
  return [
    ...RULES,
    "",
    `Node labels: ${listOrNone(schema.labels)}`,
    `Relationship types: ${listOrNone(schema.relationshipTypes)}`,
    "",
    "Examples:",
    ...EXAMPLES,
    ...OUTPUT_INSTRUCTIONS,
  ].join("\n");
}

/** Builds the prompt that asks the model to fix a query that failed. */
export function buildRetryPrompt(
  question: string,
  failedCypher: string,
  error: string,
): string {
  return [
    `Question: ${question}`,
    `This Cypher query failed: ${failedCypher}`,
    `Error: ${error}`,
    'Reply with a corrected read-only Cypher query as a JSON object only: {"cypher_query": "<cypher query here>"}',
  ].join("\n");
}

function listOrNone(names: string[]): string {
  return names.length > 0 ? names.join(", ") : "(none)";
}
