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

interface NodeTypeEntry {
  id: number;
  /** The node type name, such as Person. */
  type: string;
  /** The description the classifier model reads for this type. */
  description: string;
}

const db = new Dexie("NotesDB") as Dexie & {
  notes: EntityTable<
    Note,
    "id" // primary key "id" (for the typings only)
  >;
  nodeTypes: EntityTable<
    NodeTypeEntry,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  notes: "++id, createdAt, updatedAt", // primary key "id" (for the runtime!)
});
db.version(2).stores({
  nodeTypes: "++id, type", // primary key "id" (for the runtime!)
});

export type { Note, NodeTypeEntry };
export { db };
