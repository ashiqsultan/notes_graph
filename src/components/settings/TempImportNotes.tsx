// TEMPORARY: imports notes from a JSON array of {title, body} and builds each graph. Remove before release.
import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { useRefreshNotesAndGraph } from "@/hooks/useRefreshNotesAndGraph";
import type { Note } from "@/db";
import { getWords } from "@/graph/getWords";
import { isRecord } from "@/graph/relateElements";
import { displayTitle, toNoteText, waitForGraphSyncs } from "@/graph/syncNoteGraph";
import { updateNoteGraph } from "@/graph/updateNoteGraph";
import { createNote, deleteNote, type NoteInput } from "@/lib/notes";

interface ImportStatus {
  total: number;
  added: number;
  failed: number;
}

/** Temporary button that imports notes from a JSON file and builds each note's graph in turn. */
function TempImportNotes() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const refreshAfterImport = useRefreshNotesAndGraph();

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImporting(true);
    try {
      await waitForGraphSyncs();
      await importItems(await readItems(file), setStatus);
      refreshAfterImport();
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button variant="outline" disabled={importing} onClick={() => inputRef.current?.click()}>
        {importing ? "Importing…" : "Temp import notes"}
      </Button>
      {status && (
        <p className="text-sm text-muted-foreground">
          Total {status.total} · Added {status.added} · Failed {status.failed}
        </p>
      )}
    </>
  );
}

/** Reads the file and returns its usable items. A file that is not valid JSON gives no items. */
async function readItems(file: File): Promise<NoteInput[]> {
  try {
    return importableItems(JSON.parse(await file.text()));
  } catch {
    return [];
  }
}

function importableItems(data: unknown): NoteInput[] {
  if (!Array.isArray(data)) return [];
  return data.filter(isImportable).map((item) => ({ title: item.title, body: item.body }));
}

function isImportable(value: unknown): value is NoteInput {
  return (
    isRecord(value) &&
    typeof value.title === "string" &&
    typeof value.body === "string" &&
    (value.title.trim() !== "" || value.body.trim() !== "")
  );
}

/** Imports the items one after another, reporting the status after each one. */
async function importItems(
  items: NoteInput[],
  onProgress: (status: ImportStatus) => void
): Promise<void> {
  const status: ImportStatus = { total: items.length, added: 0, failed: 0 };
  onProgress({ ...status });
  for (const item of items) {
    if (await importItem(item)) status.added++;
    else status.failed++;
    onProgress({ ...status });
  }
}

/** Creates one note and builds its graph. A note whose graph fails is removed again, so it counts as not added. */
async function importItem(input: NoteInput): Promise<boolean> {
  let note: Note | null = null;
  try {
    note = await createNote(input);
    const text = toNoteText(note);
    await updateNoteGraph(note.id, displayTitle(note.title), text, getWords(text));
    return true;
  } catch {
    if (note) await deleteNote(note.id).catch(() => undefined);
    return false;
  }
}

export { TempImportNotes };
