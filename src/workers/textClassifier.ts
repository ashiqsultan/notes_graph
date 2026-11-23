import { OpenJev, choice } from "open-jev";
import {
  FALLBACK_NODE_DESCRIPTION,
  FALLBACK_NODE_TYPE,
  type NodeTypeDefinition,
} from "@/graph/nodeTypes";

const MODEL_ID = "onnx-community/kev-0.6b-ONNX";
const MIN_CONFIDENCE = 0.5;

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

/** The type names and their descriptions the classifier chooses between. */
function toOptions(nodeTypes: NodeTypeDefinition[]) {
  const options = [...nodeTypes.map((entry) => entry.type), FALLBACK_NODE_TYPE];
  const descriptions = {
    ...Object.fromEntries(nodeTypes.map((entry) => [entry.type, entry.description])),
    [FALLBACK_NODE_TYPE]: FALLBACK_NODE_DESCRIPTION,
  };
  return { options, descriptions };
}

/** Classifies a word by the sentence it appears in. Returns the fallback type when unsure. */
export async function classifyWord(
  jev: OpenJev,
  word: string,
  sentence: string,
  nodeTypes: NodeTypeDefinition[],
): Promise<string> {
  const { options, descriptions } = toOptions(nodeTypes);
  const [answer] = await jev.decide(sentence, [
    choice(`Which type is the word "${word}" in this text?`, options, descriptions),
  ]);
  return answer.confidence < MIN_CONFIDENCE ? FALLBACK_NODE_TYPE : answer.choice;
}
