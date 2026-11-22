const THINKING_BLOCK = /<think>[\s\S]*?(<\/think>|$)/g;
const CODE_FENCE = /```[a-zA-Z]*\s*([\s\S]*?)```/;

/** Turns a model reply into the bare Cypher query it contains. */
export function cypherFromReply(reply: string): string {
  const visible = reply.replace(THINKING_BLOCK, "");
  const fenced = CODE_FENCE.exec(visible);
  return (fenced ? fenced[1] : visible).trim();
}
