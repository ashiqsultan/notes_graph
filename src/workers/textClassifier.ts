import { OpenJev, choice } from "open-jev";
import {
  CLASSIFIED_NODE_TYPES,
  FALLBACK_NODE_DESCRIPTION,
  FALLBACK_NODE_TYPE,
  type NodeType,
} from "@/graph/nodeTypes";

const MODEL_ID = "onnx-community/kev-0.6b-ONNX";
const MIN_CONFIDENCE = 0.5;

const NODE_TYPE_OPTIONS: NodeType[] = [
  ...CLASSIFIED_NODE_TYPES.map((entry) => entry.type),
  FALLBACK_NODE_TYPE,
];

const NODE_TYPE_DESCRIPTIONS: Partial<Record<NodeType, string>> = {
  ...Object.fromEntries(CLASSIFIED_NODE_TYPES.map((entry) => [entry.type, entry.description])),
  [FALLBACK_NODE_TYPE]: FALLBACK_NODE_DESCRIPTION,
};

let jevPromise: Promise<OpenJev> | null = null;

/** Loads the model once and reuses it afterwards. Progress is reported as a percent from 0 to 100. */
export function loadTextClassifier(onProgress?: (percent: number) => void): Promise<OpenJev> {
  jevPromise ??= OpenJev.load({
    model: MODEL_ID,
    dtype: "q4f16",
    onProgress: ({ progress }) => onProgress?.(progress * 100),
  });
  return jevPromise;
}

/** Classifies a word by the sentence it appears in. Returns the fallback type when unsure. */
export async function classifyWord(jev: OpenJev, word: string, sentence: string): Promise<NodeType> {
  const [answer] = await jev.decide(sentence, [
    choice(
      `Which type is the word "${word}" in this text?`,
      NODE_TYPE_OPTIONS,
      NODE_TYPE_DESCRIPTIONS,
    ),
  ]);
  return answer.confidence < MIN_CONFIDENCE ? FALLBACK_NODE_TYPE : answer.choice;
}
