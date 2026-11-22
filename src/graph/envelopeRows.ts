// Reads the error and rows out of a relate envelope.
import { isRecord } from "@/graph/relateElements";

/** Returns the statement error in an envelope, or null when it succeeded. */
export function envelopeError(text: string): string | null {
  const envelope = parseEnvelope(text);
  if (!isRecord(envelope)) return "Invalid envelope from relate";
  return typeof envelope.error === "string" ? envelope.error : null;
}

/** Returns the rows of an envelope, or an empty list when it has none. */
export function envelopeRows(text: string): unknown[] {
  const envelope = parseEnvelope(text);
  if (!isRecord(envelope) || !Array.isArray(envelope.rows)) return [];
  return envelope.rows;
}

function parseEnvelope(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
