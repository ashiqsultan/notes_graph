import { envelopeError, envelopeRows } from "@/graph/envelopeRows";
import { isRecord } from "@/graph/relateElements";

/** Returns the node types in a node types envelope, throwing when relate reported an error. */
export function readNodeTypes(text: string): string[] {
  const error = envelopeError(text);
  if (error) throw new Error(error);
  return envelopeRows(text).flatMap(toType);
}

function toType(row: unknown): string[] {
  if (!isRecord(row) || typeof row.type !== "string") return [];
  return [row.type];
}
