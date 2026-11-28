import { db, type Note } from "@/db";
import { readGraphElements, type GraphElements } from "@/graph/readGraphElements";
import { waitForGraphSyncs } from "@/graph/syncNoteGraph";

interface NotesBackup {
  notes: Note[];
  graph: GraphElements;
}

/** Downloads every note and the graph as one pretty-printed JSON file. */
export async function exportBackup(): Promise<void> {
  await waitForGraphSyncs();
  const backup = await buildBackup();
  downloadJson(backup, backupFileName(new Date()));
}

async function buildBackup(): Promise<NotesBackup> {
  const [notes, graph] = await Promise.all([db.notes.orderBy("id").toArray(), readGraphElements()]);
  return { notes, graph };
}

/** Names the file by local day and Unix seconds, so two exports on one day never collide. */
function backupFileName(now: Date): string {
  const day = now.toLocaleDateString("en-CA");
  const seconds = Math.floor(now.getTime() / 1000);
  return `notes-backup-${day}-${seconds}.json`;
}

function downloadJson(data: unknown, fileName: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
