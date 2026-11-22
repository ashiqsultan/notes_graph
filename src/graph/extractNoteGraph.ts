import { EXTRACTION_SYSTEM_PROMPT } from "@/graph/extractionPrompt";
import { parseExtraction, type ExtractedGraph } from "@/graph/parseExtraction";
import { generateText } from "@/lib/llm";

/** Asks the model for the entities and relations in a note's text. */
export async function extractNoteGraph(noteText: string): Promise<ExtractedGraph> {
  const reply = await generateText(noteText, EXTRACTION_SYSTEM_PROMPT);
  return parseExtraction(reply);
}
