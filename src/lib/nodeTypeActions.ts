import type { NodeTypeEntry } from "@/db";
import { renameEntityType, resetEntityType } from "@/graph/nodeTypeGraph";
import {
  deleteNodeType,
  updateNodeType,
  type NodeTypeInput,
} from "@/lib/nodeTypes";

/** Saves an edited node type. The graph is renamed first when the name changed, so a failure leaves the settings untouched. */
export async function saveEditedNodeType(
  id: number,
  previousType: string,
  input: NodeTypeInput,
): Promise<void> {
  if (previousType !== input.type) await renameEntityType(previousType, input.type);
  await updateNodeType(id, input);
}

/** Deletes a node type. Its entities move to the fallback type in the graph first. */
export async function removeNodeType(entry: NodeTypeEntry): Promise<void> {
  await resetEntityType(entry.type);
  await deleteNodeType(entry.id);
}
