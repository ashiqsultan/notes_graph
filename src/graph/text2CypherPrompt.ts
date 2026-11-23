import type { GraphSchema } from "@/graph/readSchema";

const RULES = [
  "You translate questions into one Cypher query for a graph database.",
  "Reply with the Cypher query only: no explanation, no markdown.",
  "Use only the node labels and relationship types listed below.",
  "When trying to match strings it should NOT be case sensitive, Please match both lowercase and uppercase",
  "The query must be read-only: use MATCH, OPTIONAL MATCH, WHERE, WITH, RETURN, ORDER BY and LIMIT only.",
  "Never use CREATE, MERGE, DELETE, DETACH, SET, REMOVE, DROP, LOAD CSV or CALL.",
  "When the question asks about things or how they connect, return the matching nodes and relationships so they can be drawn.",
];

const EXAMPLES = [
  "Question: What is connected to the node named Alpha?",
  "Cypher: MATCH (n {name: 'Alpha'})-[r]-(m) RETURN n, r, m",
  "",
  "Question: How many nodes does each label have?",
  "Cypher: MATCH (n) UNWIND labels(n) AS label RETURN label, count(*) AS total ORDER BY total DESC",
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
  ].join("\n");
}

/** Builds the prompt that asks the model to fix a query that failed. */
export function buildRetryPrompt(question: string, failedCypher: string, error: string): string {
  return [
    `Question: ${question}`,
    `This Cypher query failed: ${failedCypher}`,
    `Error: ${error}`,
    "Reply with a corrected read-only Cypher query only.",
  ].join("\n");
}

function listOrNone(names: string[]): string {
  return names.length > 0 ? names.join(", ") : "(none)";
}
