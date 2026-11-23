const THINKING_BLOCK = /<think>[\s\S]*?(<\/think>|$)/g;

/** Reads the cypher_query field from the JSON object in a model reply. */
export function cypherFromJsonReply(reply: string): string {
  const json = extractJsonObject(reply.replace(THINKING_BLOCK, ""));
  const parsed = JSON.parse(json) as { cypher_query?: unknown };
  return cypherQueryField(parsed).trim();
}

function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end < start) throw new Error("Model reply contains no JSON object");
  return text.slice(start, end + 1);
}

function cypherQueryField(parsed: { cypher_query?: unknown }): string {
  if (typeof parsed.cypher_query !== "string") {
    throw new Error("Model reply has no cypher_query string");
  }
  return parsed.cypher_query;
}
