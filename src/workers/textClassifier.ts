import {
  pipeline,
  type ProgressCallback,
  type ZeroShotClassificationPipeline,
} from "@huggingface/transformers";
import {
  CLASSIFIED_NODE_TYPES,
  FALLBACK_NODE_DESCRIPTION,
  FALLBACK_NODE_TYPE,
  type NodeType,
} from "@/graph/nodeTypes";

const MODEL_ID = "Xenova/roberta-large-mnli";
const MIN_SCORE = 0.5;

let classifierPromise: Promise<ZeroShotClassificationPipeline> | null = null;

/** Creates the zero-shot classification pipeline once and reuses it afterwards. */
export function loadTextClassifier(
  onProgress?: ProgressCallback,
): Promise<ZeroShotClassificationPipeline> {
  classifierPromise ??= pipeline("zero-shot-classification", MODEL_ID, {
    progress_callback: onProgress,
  });
  return classifierPromise;
}

/** Classifies a word by the sentence it appears in. Returns the fallback type when unsure. */
export async function classifyWord(
  classifier: ZeroShotClassificationPipeline,
  word: string,
  sentence: string,
): Promise<NodeType> {
  const output = await classifier(`"${word}" in: ${sentence}`, candidateLabels());
  return pickNodeType(output);
}

function candidateLabels(): string[] {
  return [...CLASSIFIED_NODE_TYPES.map((entry) => entry.description), FALLBACK_NODE_DESCRIPTION];
}

function pickNodeType(output: { labels: string[]; scores: number[] }): NodeType {
  const [topDescription] = output.labels;
  const [topScore] = output.scores;
  if (topDescription === undefined || topScore === undefined) return FALLBACK_NODE_TYPE;
  if (topScore < MIN_SCORE) return FALLBACK_NODE_TYPE;
  return typeForDescription(topDescription);
}

function typeForDescription(description: string): NodeType {
  const entry = CLASSIFIED_NODE_TYPES.find((item) => item.description === description);
  return entry?.type ?? FALLBACK_NODE_TYPE;
}
