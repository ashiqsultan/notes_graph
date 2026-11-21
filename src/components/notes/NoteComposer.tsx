import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useNotesStore } from "@/store";

interface NoteComposerFormProps {
  isEditing: boolean;
  initialTitle: string;
  initialBody: string;
}

/** The form inside the composer dialog. Remounted (via `key`) for each note. */
function NoteComposerForm({
  isEditing,
  initialTitle,
  initialBody,
}: NoteComposerFormProps) {
  const saveNote = useNotesStore((state) => state.saveNote);
  const closeComposer = useNotesStore((state) => state.closeComposer);

  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);

  const canSave = title.trim().length > 0 || body.trim().length > 0;

  async function handleSave() {
    if (!canSave) return;

    await saveNote({ title: title.trim(), body: body.trim() });
    toast.add({
      title: isEditing ? "Note updated" : "Note created",
      type: "success",
    });
  }

  return (
    <DialogContent className="flex h-[85svh] max-h-[85svh] flex-col sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit note" : "New note"}</DialogTitle>
      </DialogHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          aria-label="Note title"
        />
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Take a note..."
          aria-label="Note body"
          className="min-h-0 flex-1 field-sizing-fixed"
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={closeComposer}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave}>
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

/** The single composer dialog, used for both creating and editing a note. */
function NoteComposer() {
  const composerOpen = useNotesStore((state) => state.composerOpen);
  const editingNoteId = useNotesStore((state) => state.editingNoteId);
  const notes = useNotesStore((state) => state.notes);
  const closeComposer = useNotesStore((state) => state.closeComposer);

  const editingNote = notes.find((note) => note.id === editingNoteId) ?? null;

  return (
    <Dialog
      open={composerOpen}
      onOpenChange={(open) => {
        if (!open) closeComposer();
      }}
    >
      {composerOpen && (
        <NoteComposerForm
          key={editingNoteId ?? "new"}
          isEditing={editingNote !== null}
          initialTitle={editingNote?.title ?? ""}
          initialBody={editingNote?.body ?? ""}
        />
      )}
    </Dialog>
  );
}

export { NoteComposer };
