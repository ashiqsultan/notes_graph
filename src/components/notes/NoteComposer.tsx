import { Dialog } from "@/components/ui/dialog";
import { useNotesStore } from "@/store";
import { NoteComposerForm } from "@/components/notes/NoteComposerForm";

/** The single composer dialog, used for both creating and editing a note. */
function NoteComposer() {
  const composerOpen = useNotesStore((state) => state.composerOpen);
  const composerSession = useNotesStore((state) => state.composerSession);
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
          key={composerSession}
          isEditing={editingNote !== null}
          initialTitle={editingNote?.title ?? ""}
          initialBody={editingNote?.body ?? ""}
        />
      )}
    </Dialog>
  );
}

export { NoteComposer };
