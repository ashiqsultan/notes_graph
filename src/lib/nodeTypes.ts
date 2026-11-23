import { db, type NodeTypeEntry } from "@/db";
import {
  CLASSIFIED_NODE_TYPES,
  type NodeTypeDefinition,
} from "@/graph/nodeTypes";

/** The user-editable part of a node type. */
export type NodeTypeInput = Pick<NodeTypeEntry, "type" | "description">;

/** Marks that the default node types have been seeded once on this device. */
const SEEDED_KEY = "node-types-seeded-v1";

/** Creates a node type. Returns the stored entry. */
export async function createNodeType(input: NodeTypeInput): Promise<NodeTypeEntry> {
  const id = await db.nodeTypes.add(input);
  return { id, ...input };
}

/** Fetches all node types, ordered by name. */
export async function getAllNodeTypes(): Promise<NodeTypeEntry[]> {
  return db.nodeTypes.orderBy("type").toArray();
}

/** Updates a node type's name and description. */
export async function updateNodeType(id: number, input: NodeTypeInput): Promise<void> {
  await db.nodeTypes.update(id, input);
}

/** Permanently deletes a node type. */
export async function deleteNodeType(id: number): Promise<void> {
  await db.nodeTypes.delete(id);
}

/**
 * Seeds the default node types on the first run only. A localStorage flag
 * ensures a table emptied by the user is not re-seeded on later loads.
 */
export async function seedNodeTypesIfNeeded(): Promise<void> {
  if (localStorage.getItem(SEEDED_KEY)) return;
  localStorage.setItem(SEEDED_KEY, "1");
  if ((await db.nodeTypes.count()) > 0) return;
  await db.nodeTypes.bulkAdd(CLASSIFIED_NODE_TYPES);
}

/** Returns the node types for the classifier, seeding defaults on first run. */
export async function getNodeTypeOptions(): Promise<NodeTypeDefinition[]> {
  await seedNodeTypesIfNeeded();
  const entries = await getAllNodeTypes();
  return entries.map(({ type, description }) => ({ type, description }));
}
