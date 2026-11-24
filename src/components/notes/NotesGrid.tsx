import { NoteCard } from "@/components/notes/NoteCard";
import { NotesEmpty } from "@/components/notes/NotesEmpty";
import { NoMatchingNotes } from "@/components/notes/NoMatchingNotes";
import type { Note } from "@/db";
import { useNoteTypes } from "@/hooks/use-note-types";
import { useNotesStore } from "@/store";

/** Responsive masonry-style grid of note cards, filtered by the search. */
function NotesGrid() {
  const notes = useNotesStore((state) => state.notes);
  const searchText = useNotesStore((state) => state.searchText);
  const matchingNoteIds = useNotesStore((state) => state.matchingNoteIds);
  const noteTypes = useNoteTypes();

  if (notes.length === 0) {
    return <NotesEmpty />;
  }

  const visibleNotes = filterNotes(notes, searchText, matchingNoteIds);
  if (visibleNotes.length === 0) {
    return <NoMatchingNotes />;
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {visibleNotes.map((note) => (
        <NoteCard key={note.id} note={note} nodeTypes={noteTypes.get(note.id) ?? []} />
      ))}
    </div>
  );
}

/** Keeps every note when the search is blank, otherwise only the notes the search matched. */
function filterNotes(notes: Note[], searchText: string, matchingNoteIds: Set<number> | null): Note[] {
  if (!searchText.trim() || !matchingNoteIds) return notes;
  return notes.filter((note) => matchingNoteIds.has(note.id));
}

export { NotesGrid };
