/** A node type name with the description the classifier model reads. */
export interface NodeTypeDefinition {
  type: string;
  description: string;
}

/** The type given to a word when no classified type fits. */
export const FALLBACK_NODE_TYPE = "Entity";

/** The label the model sees for the fallback type. */
export const FALLBACK_NODE_DESCRIPTION = "others";

/** Names the app uses for itself, so users cannot pick them as node types. */
export const RESERVED_NODE_TYPES = [FALLBACK_NODE_TYPE, "Note"];

/**
 * Default node types seeded on the first run. The description is what the
 * classifier model reads. Users can change these in the settings dialog.
 */
export const CLASSIFIED_NODE_TYPES: NodeTypeDefinition[] = [
  { type: "Person", description: "Name of a human" },
  { type: "Place", description: "Name of any city, country, place or any location" },
  { type: "Date_Time", description: "Date or time or day of week or month names etc" },
  { type: "Technology", description: "A tool, software, or technology like AI or programming language etc" },
];

/** A classified node type. Types are user-defined, so this is any string. */
export type NodeType = string;
