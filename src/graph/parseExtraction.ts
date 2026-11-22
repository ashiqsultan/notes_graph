import { isRecord } from "@/graph/relateElements";

/** An entity ready to merge. `id` is the Cypher variable, `key` the merge key. */
export interface GraphEntity {
  id: string;
  key: string;
  label: string;
  name: string;
}

export interface GraphRelation {
  from: string;
  to: string;
  type: string;
}

export interface ExtractedGraph {
  entities: GraphEntity[];
  relations: GraphRelation[];
}

interface RawEntity {
  id: string;
  label: string;
  name: string;
}

const DEFAULT_LABEL = "Entity";
const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Turns the model's reply into a clean graph. Throws when the reply holds no
 * JSON object, so the caller can keep the existing graph. Bad items inside
 * valid JSON are dropped one by one.
 */
export function parseExtraction(reply: string): ExtractedGraph {
  const data = readJsonObject(reply);
  const rawEntities = readList(data.entities).flatMap(toRawEntity);
  const { entities, entityById } = mergeDuplicateEntities(rawEntities);
  const relations = readList(data.relations).flatMap((raw) => toRelation(raw, entityById));
  return { entities, relations: removeDuplicateRelations(relations) };
}

function readJsonObject(reply: string): Record<string, unknown> {
  const start = reply.indexOf("{");
  const end = reply.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("The model did not return JSON");

  const data = parseJson(reply.slice(start, end + 1));
  if (!isRecord(data)) throw new Error("The model returned invalid JSON");
  return data;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toRawEntity(raw: unknown): RawEntity[] {
  if (!isRecord(raw)) return [];
  const id = readId(raw.id);
  const name = readName(raw.name);
  if (!id || !name) return [];
  return [{ id, label: toIdentifier(raw.label) ?? DEFAULT_LABEL, name }];
}

function readId(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return null;
}

function readName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  return name || null;
}

/** Replaces runs of unsafe characters with `_` so the value is a valid label or type. */
function toIdentifier(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const identifier = value.trim().replace(/[^A-Za-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  return IDENTIFIER_PATTERN.test(identifier) ? identifier : null;
}

/** Entities with the same label and name become one, whatever ids the model gave them. */
function mergeDuplicateEntities(rawEntities: RawEntity[]) {
  const byKey = new Map<string, GraphEntity>();
  const entityById = new Map<string, GraphEntity>();

  for (const raw of rawEntities) {
    const key = `${raw.label}|${raw.name.toLowerCase()}`;
    const entity = byKey.get(key) ?? {
      id: `e${byKey.size}`,
      key: raw.name.toLowerCase(),
      label: raw.label,
      name: raw.name,
    };
    byKey.set(key, entity);
    entityById.set(raw.id, entity);
  }

  return { entities: [...byKey.values()], entityById };
}

function toRelation(
  raw: unknown,
  entityById: Map<string, GraphEntity>,
): GraphRelation[] {
  if (!isRecord(raw)) return [];
  const from = entityById.get(readId(raw.from) ?? "");
  const to = entityById.get(readId(raw.to) ?? "");
  const type = toIdentifier(raw.type)?.toUpperCase();
  if (!from || !to || !type) return [];
  return [{ from: from.id, to: to.id, type }];
}

function removeDuplicateRelations(relations: GraphRelation[]): GraphRelation[] {
  const unique = new Map<string, GraphRelation>();
  for (const relation of relations) {
    unique.set(`${relation.from}|${relation.type}|${relation.to}`, relation);
  }
  return [...unique.values()];
}
