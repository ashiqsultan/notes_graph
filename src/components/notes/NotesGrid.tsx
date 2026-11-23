import { NoteCard } from "@/components/notes/NoteCard";
import { NotesEmpty } from "@/components/notes/NotesEmpty";
import { useNoteTypes } from "@/hooks/use-note-types";
import { useNotesStore } from "@/store";

/** Responsive masonry-style grid of note cards. */
function NotesGrid() {
  const notes = useNotesStore((state) => state.notes);
  const noteTypes = useNoteTypes();

  if (notes.length === 0) {
    return <NotesEmpty />;
  }

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} nodeTypes={noteTypes.get(note.id) ?? []} />
      ))}
    </div>
  );
}

export { NotesGrid };
