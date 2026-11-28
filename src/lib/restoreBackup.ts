import { validateGraph } from "@/backup/validateGraph";
import { validateNotes } from "@/backup/validateNotes";
import { db, type Note } from "@/db";
import type { GraphElements } from "@/graph/readGraphElements";
import { restoreGraph } from "@/graph/restoreGraph";
import { isRecord } from "@/graph/relateElements";
import { waitForGraphSyncs } from "@/graph/syncNoteGraph";
import { clearAll } from "@/lib/clearAll";

interface NotesBackup {
  notes: Note[];
  graph: GraphElements;
}

/** Replaces every note and the graph with the contents of a backup file. */
export async function restoreBackup(file: File): Promise<void> {
  await restoreBackupData(JSON.parse(await file.text()));
}

/** Replaces every note and the graph with already parsed backup data. */
export async function restoreBackupData(data: unknown): Promise<void> {
  const backup = parseBackup(data);
  await waitForGraphSyncs();
  await clearAll();
  await db.notes.bulkAdd(backup.notes);
  await restoreGraph(backup.graph);
}

/** Checks the whole data before anything is cleared. Throws when it is not a backup. */
function parseBackup(data: unknown): NotesBackup {
  if (!isRecord(data)) throw new Error("the file is not a backup object");
  const notes = validateNotes(data.notes);
  const graph = keepGraphOfNotes(validateGraph(data.graph), notes);
  return { notes, graph };
}

/** Drops the Note nodes of notes that were skipped, and the relationships that touched them. */
function keepGraphOfNotes(graph: GraphElements, notes: Note[]): GraphElements {
  const noteKeys = new Set(notes.map((note) => String(note.id)));
  const nodes = graph.nodes.filter((node) => !isOrphanNote(node.labels, node.properties, noteKeys));
  const keptIds = new Set(nodes.map((node) => node.id));
  const relationships = graph.relationships.filter(
    (rel) => keptIds.has(rel.start_node) && keptIds.has(rel.end_node)
  );
  return { nodes, relationships };
}

function isOrphanNote(labels: string[], properties: Record<string, unknown>, noteKeys: Set<string>) {
  return labels.includes("Note") && !noteKeys.has(String(properties.key));
}
