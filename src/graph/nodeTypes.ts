/** The type given to a word when no classified type fits. */
export const FALLBACK_NODE_TYPE = "Entity";

/** The label the model sees for the fallback type. */
export const FALLBACK_NODE_DESCRIPTION = "others";

/** Types a word can be classified as. The description is what the model reads. */
export const CLASSIFIED_NODE_TYPES = [
  { type: "Person", description: "a Human Name" },
  { type: "Place", description: "a city, country, or any place or location" },
  { type: "Date_Time", description: "date or time" },
  { type: "Technology", description: "a tool, software, or technology like AI programming language" },
] as const;

export type NodeType =
  | (typeof CLASSIFIED_NODE_TYPES)[number]["type"]
  | typeof FALLBACK_NODE_TYPE;
