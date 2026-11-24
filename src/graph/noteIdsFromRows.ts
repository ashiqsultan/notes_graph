import { isRecord, isRelateNode } from "@/graph/relateElements";

/** Returns the note ids of every Note node in the `n` and `m` columns of result rows. */
export function noteIdsFromRows(rows: unknown[]): Set<number> {
  const ids = new Set<number>();
  for (const row of rows) {
    for (const id of rowNoteIds(row)) ids.add(id);
  }
  return ids;
}

function rowNoteIds(row: unknown): number[] {
  if (!isRecord(row)) return [];
  return [row.n, row.m].flatMap(toNoteId);
}

function toNoteId(value: unknown): number[] {
  if (!isRelateNode(value) || !value.labels.includes("Note")) return [];
  const id = Number(value.properties.key);
  return Number.isInteger(id) ? [id] : [];
}
