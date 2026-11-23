import type { GraphSchema } from "@/graph/readSchema";

const RULES = [
  "You are a Neo4j Cypher query expert, You are provided with the Available Node Types and Relationships in a Graph DB",
  "Your only job is to translate the user question into a Cypher query",
  'Reply with a JSON object only, in exactly this format: {"cypher_query": "<cypher query here>"}',
  "Put the whole Cypher query as one string in cypher_query.",
  "No explanation, no markdown, no code fences.",
  "Use only the node labels and relationship types listed below.",
  "When trying to match strings it should NOT be case sensitive",
  "The query must be read-only: use MATCH, OPTIONAL MATCH, WHERE, WITH, RETURN, ORDER BY and LIMIT only.",
  "Never use CREATE, MERGE, DELETE, DETACH, SET, REMOVE, DROP, LOAD CSV or CALL.",
  "When the question asks about things or how they connect, return the matching nodes and relationships so they can be drawn.",
];

const EXAMPLES = [
  "Question: What is connected to the node named Alpha?",
  '{"cypher_query": "MATCH (n {name: \'Alpha\'})-[r]-(m) RETURN n, r, m"}',
  "",
  "Question: How many nodes does each label have?",
  '{"cypher_query": "MATCH (n) UNWIND labels(n) AS label RETURN label, count(*) AS total ORDER BY total DESC"}',
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
