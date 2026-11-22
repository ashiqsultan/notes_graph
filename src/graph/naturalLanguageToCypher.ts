import { cypherFromReply } from "@/graph/cypherFromReply";
import { envelopeError } from "@/graph/envelopeRows";
import { readOnlyViolation } from "@/graph/readOnlyGuard";
import { readSchema } from "@/graph/readSchema";
import { runCypher } from "@/graph/relateClient";
import { buildRetryPrompt, buildSystemPrompt } from "@/graph/text2CypherPrompt";
import type { Text2CypherStage } from "@/graph/text2CypherStages";
import { generateText } from "@/lib/llm";

export interface Text2CypherResult {
  cypher: string;
  /** The envelope of the query that ran; empty when it never ran. */
  envelope: string;
  /** The error of the final attempt, or null when it succeeded. */
  error: string | null;
}

type StageReporter = (stage: Text2CypherStage) => void;

/** Turns a question into a read-only Cypher query, runs it, and retries once if it fails. */
export async function naturalLanguageToCypher(
  question: string,
  onStage: StageReporter,
): Promise<Text2CypherResult> {
  onStage("schema");
  const systemPrompt = buildSystemPrompt(await readSchema());

  onStage("generating");
  const first = await attemptQuery(await generateCypher(question, systemPrompt), onStage);
  if (!first.error) return first;

  onStage("retrying");
  const retryPrompt = buildRetryPrompt(question, first.cypher, first.error);
  return attemptQuery(await generateCypher(retryPrompt, systemPrompt), onStage);
}

async function generateCypher(prompt: string, systemPrompt: string): Promise<string> {
  return cypherFromReply(await generateText(prompt, systemPrompt));
}

async function attemptQuery(cypher: string, onStage: StageReporter): Promise<Text2CypherResult> {
  const violation = readOnlyViolation(cypher);
  if (violation) return { cypher, envelope: "", error: violation };

  onStage("running");
  const envelope = await runCypher(cypher);
  return { cypher, envelope, error: envelopeError(envelope) };
}
