// Reads every raw node and relationship out of the graph, for export.
import { envelopeError, envelopeRows } from "@/graph/envelopeRows";
import { ALL_NODES_QUERY, ALL_RELATIONSHIPS_QUERY } from "@/graph/exportGraphQuery";
import { collectElements } from "@/graph/graphFromEnvelope";
import { runCypher } from "@/graph/relateClient";
import {
  isRelateNode,
  isRelateRelationship,
  type RelateNode,
  type RelateRelationship,
} from "@/graph/relateElements";

export interface GraphElements {
  nodes: RelateNode[];
  relationships: RelateRelationship[];
}

/** Returns every node and relationship in the graph as relate stores them. */
export async function readGraphElements(): Promise<GraphElements> {
  const nodes = await readElements(ALL_NODES_QUERY, isRelateNode);
  const relationships = await readElements(ALL_RELATIONSHIPS_QUERY, isRelateRelationship);
  return { nodes, relationships };
}

/** Runs a statement and returns the elements it matches; throws when relate reports an error. */
async function readElements<T>(
  statement: string,
  isElement: (value: unknown) => value is T
): Promise<T[]> {
  const envelope = await runCypher(statement);
  const error = envelopeError(envelope);
  if (error) throw new Error(error);
  return envelopeRows(envelope).flatMap(collectElements).filter(isElement);
}
