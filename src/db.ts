// db.ts
import { Dexie, type EntityTable } from "dexie";

interface Note {
  id: number;
  title: string;
  body: string;
  /** Epoch ms when the note was created. */
  createdAt: number;
  /** Epoch ms when the note was last edited. */
  updatedAt: number;
}

const db = new Dexie("NotesDB") as Dexie & {
  notes: EntityTable<
    Note,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  notes: "++id, createdAt, updatedAt", // primary key "id" (for the runtime!)
});

export type { Note };
export { db };
