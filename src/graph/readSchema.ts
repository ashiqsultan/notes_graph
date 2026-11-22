import { envelopeError, envelopeRows } from "@/graph/envelopeRows";
import { LABELS_QUERY, RELATIONSHIP_TYPES_QUERY } from "@/graph/schemaQueries";
import { runCypher } from "@/graph/relateClient";
import { isRecord } from "@/graph/relateElements";

export interface GraphSchema {
  labels: string[];
  relationshipTypes: string[];
}

/** Reads the node labels and relationship types currently in the graph. */
export async function readSchema(): Promise<GraphSchema> {
  const [labels, relationshipTypes] = await Promise.all([
    readColumn(LABELS_QUERY, "label"),
    readColumn(RELATIONSHIP_TYPES_QUERY, "relationshipType"),
  ]);
  return { labels, relationshipTypes };
}

async function readColumn(query: string, column: string): Promise<string[]> {
  const envelope = await runCypher(query);
  const error = envelopeError(envelope);
  if (error) throw new Error(error);
  return envelopeRows(envelope).flatMap((row) => columnValue(row, column));
}

function columnValue(row: unknown, column: string): string[] {
  if (!isRecord(row)) return [];
  const value = row[column];
  return typeof value === "string" ? [value] : [];
}
