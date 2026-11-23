/** The type given to a word when no classified type fits. */
export const FALLBACK_NODE_TYPE = "Entity";

/** Types a word can be classified as. The description is what the model reads. */
export const CLASSIFIED_NODE_TYPES = [
  { type: "Person", description: "a person's name" },
  { type: "Place", description: "a city, country, or other location" },
  { type: "Date_Time", description: "a date, time, or period" },
  { type: "Project", description: "a project, task, or piece of work" },
  { type: "Technology", description: "a tool, software, or technology" },
] as const;

export type NodeType =
  | (typeof CLASSIFIED_NODE_TYPES)[number]["type"]
  | typeof FALLBACK_NODE_TYPE;
