import {
  pipeline,
  type ProgressCallback,
  type TextGenerationPipeline,
} from "@huggingface/transformers";

const MODEL_ID = "onnx-community/Qwen3.5-0.8B-ONNX";
const SYSTEM_PROMPT = "You are a helpful assistant. Answer the user's question.";
const MAX_NEW_TOKENS = 1024;

let generatorPromise: Promise<TextGenerationPipeline> | null = null;

/** Creates the WebGPU text-generation pipeline once and reuses it afterwards. */
export function loadTextGenerator(
  onProgress: ProgressCallback,
): Promise<TextGenerationPipeline> {
  generatorPromise ??= pipeline("text-generation", MODEL_ID, {
    device: "webgpu",
    // dtype: "q4",
    dtype: "q8",
    progress_callback: onProgress,
  });
  return generatorPromise;
}

/** Sends a single-turn prompt with the system prompt and returns the assistant reply. */
export async function generateReply(
  generator: TextGenerationPipeline,
  prompt: string,
  systemPrompt: string = SYSTEM_PROMPT,
): Promise<string> {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];
  const [output] = await generator(messages, {
    max_new_tokens: MAX_NEW_TOKENS,
    do_sample: false,
  });
  return extractAssistantText(output.generated_text);
}

function extractAssistantText(generatedText: unknown): string {
  if (typeof generatedText === "string") return generatedText;
  if (!Array.isArray(generatedText)) return "";
  const last: unknown = generatedText.at(-1);
  return getContent(last);
}

function getContent(message: unknown): string {
  if (typeof message !== "object" || message === null) return "";
  const content: unknown = Reflect.get(message, "content");
  return typeof content === "string" ? content : "";
}
