import { CornerDownLeftIcon } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAutoSave } from "@/hooks/useAutoSave";
import { getSaveShortcutModifierLabel, isSaveShortcut } from "@/lib/keyboard";
import { useNotesStore } from "@/store";
import type { NoteInput } from "@/lib/notes";

const AUTO_SAVE_DELAY_MS = 800;

interface NoteComposerFormProps {
  isEditing: boolean;
  initialTitle: string;
  initialBody: string;
}

/** The form inside the composer dialog. Remounted (via `key`) for each session. */
function NoteComposerForm({
  isEditing,
  initialTitle,
  initialBody,
}: NoteComposerFormProps) {
  const persistNote = useNotesStore((state) => state.persistNote);
  const closeComposer = useNotesStore((state) => state.closeComposer);

  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);

  const autoSave = useAutoSave<NoteInput>(persistNote, AUTO_SAVE_DELAY_MS);

  function handleTitleChange(value: string) {
    setTitle(value);
    autoSave({ title: value.trim(), body: body.trim() });
  }

  function handleBodyChange(value: string) {
    setBody(value);
    autoSave({ title: title.trim(), body: value.trim() });
  }

  async function handleDone() {
    await autoSave.flush();
    closeComposer();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!isSaveShortcut(event)) return;

    event.preventDefault();
    void handleDone();
  }

  return (
    <DialogContent
      className="flex h-[85svh] max-h-[85svh] flex-col sm:max-w-4xl"
      onKeyDown={handleKeyDown}
    >
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit note" : "New note"}</DialogTitle>
      </DialogHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <Input
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
          placeholder="Title"
          aria-label="Note title"
        />
        <Textarea
          value={body}
          onChange={(event) => handleBodyChange(event.target.value)}
          placeholder="Take a note..."
          aria-label="Note body"
          className="min-h-0 flex-1 field-sizing-fixed"
        />
      </div>
      <DialogFooter>
        <Button onClick={handleDone}>
          Done
          <span className="inline-flex items-center">
            ({getSaveShortcutModifierLabel()}
            <CornerDownLeftIcon className="ml-1 size-3.5" aria-hidden="true" />)
          </span>
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export { NoteComposerForm };
