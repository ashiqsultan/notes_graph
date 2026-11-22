export type Text2CypherStage = "schema" | "generating" | "running" | "retrying";

export const STAGE_INFO: Record<Text2CypherStage, { label: string; percent: number }> = {
  schema: { label: "Reading graph schema…", percent: 25 },
  generating: { label: "Generating Cypher…", percent: 50 },
  running: { label: "Running query…", percent: 75 },
  retrying: { label: "Fixing failed query…", percent: 60 },
};
