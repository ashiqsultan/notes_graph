// Writes a graph read from a backup into relate. Relate assigns new internal
// ids, so each node's file id is mapped to its new id before relationships are made.
import groupBy from "lodash/groupBy";
import { envelopeError, envelopeRows } from "@/graph/envelopeRows";
import type { GraphElements } from "@/graph/readGraphElements";
import { runCypher } from "@/graph/relateClient";
import type { RelateNode, RelateRelationship } from "@/graph/relateElements";
import { createNodesStatement, createRelationshipsStatement } from "@/graph/restoreGraphCypher";

interface NewNodeRow {
  fileId: number;
  newId: number;
}

/** Creates every node, then every relationship between them. */
export async function restoreGraph(graph: GraphElements): Promise<void> {
  const newIds = await createNodes(graph.nodes);
  await createRelationships(graph.relationships, newIds);
}

async function createNodes(nodes: RelateNode[]): Promise<Map<number, number>> {
  const newIds = new Map<number, number>();
  for (const group of Object.values(groupBy(nodes, (node) => JSON.stringify(node.labels)))) {
    const rows = group.map((node) => ({ fileId: node.id, properties: node.properties }));
    const created = (await runWrite(createNodesStatement(group[0].labels), { rows })) as NewNodeRow[];
    for (const row of created) newIds.set(row.fileId, row.newId);
  }
  return newIds;
}

async function createRelationships(
  relationships: RelateRelationship[],
  newIds: Map<number, number>
): Promise<void> {
  for (const group of Object.values(groupBy(relationships, (rel) => rel.type))) {
    const rows = group.map((rel) => ({
      start: newIds.get(rel.start_node),
      end: newIds.get(rel.end_node),
      properties: rel.properties,
    }));
    await runWrite(createRelationshipsStatement(group[0].type), { rows });
  }
}

/** Runs a write and throws when relate reports an error. Returns the envelope rows. */
async function runWrite(statement: string, params: Record<string, unknown>): Promise<unknown[]> {
  const envelope = await runCypher(statement, params);
  const error = envelopeError(envelope);
  if (error) throw new Error(error);
  return envelopeRows(envelope);
}
