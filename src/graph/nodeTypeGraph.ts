import { runWrite } from "@/graph/noteGraphClient";
import { setEntityTypeStatement } from "@/graph/noteGraphCypher";
import { FALLBACK_NODE_TYPE } from "@/graph/nodeTypes";

/** Renames the type of every entity in the graph that has the old type. */
export function renameEntityType(oldType: string, newType: string): Promise<void> {
  return runWrite(setEntityTypeStatement(oldType, newType));
}

/** Moves every entity of a deleted type to the fallback type. */
export function resetEntityType(oldType: string): Promise<void> {
  return runWrite(setEntityTypeStatement(oldType, FALLBACK_NODE_TYPE));
}
