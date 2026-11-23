import { envelopeError, envelopeRows } from "@/graph/envelopeRows";
import { linkedKeysQuery } from "@/graph/noteGraphCypher";
import { runCypher } from "@/graph/relateClient";
import { isRecord } from "@/graph/relateElements";

/** Runs a statement and throws when relate reports an error in its envelope. */
export async function runWrite(statement: string): Promise<void> {
  const error = envelopeError(await runCypher(statement));
  if (error) throw new Error(error);
}

/** Returns the keys of the words a note is currently linked to. */
export async function readLinkedKeys(noteId: number): Promise<string[]> {
  const envelope = await runCypher(linkedKeysQuery(noteId));
  const error = envelopeError(envelope);
  if (error) throw new Error(error);
  return envelopeRows(envelope).flatMap(toKey);
}

function toKey(row: unknown): string[] {
  if (!isRecord(row) || typeof row.key !== "string") return [];
  return [row.key];
}
