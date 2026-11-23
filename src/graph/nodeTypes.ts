/** The type given to a word when no classified type fits. */
export const FALLBACK_NODE_TYPE = "Entity";

/** The label the model sees for the fallback type. */
export const FALLBACK_NODE_DESCRIPTION = "others";

/** Types a word can be classified as. The description is what the model reads. */
export const CLASSIFIED_NODE_TYPES = [
  { type: "Person", description: "Name of a human" },
  { type: "Place", description: "Name of any city, country, place or any location" },
  { type: "Date_Time", description: "Date or time or day of week or month names etc" },
  { type: "Technology", description: "A tool, software, or technology like AI or programming language etc" },
] as const;

export type NodeType =
  | (typeof CLASSIFIED_NODE_TYPES)[number]["type"]
  | typeof FALLBACK_NODE_TYPE;
