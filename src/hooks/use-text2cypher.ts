import { useState } from "react";
import { naturalLanguageToCypher } from "@/graph/naturalLanguageToCypher";
import type { Text2CypherStage } from "@/graph/text2CypherStages";

/** Asks questions in plain language; each successful envelope is passed to onEnvelope. */
export function useText2Cypher(onEnvelope: (envelope: string) => void) {
  const [stage, setStage] = useState<Text2CypherStage | null>(null);
  const [cypher, setCypher] = useState("");
  const [envelope, setEnvelope] = useState("");
  const [error, setError] = useState("");

  async function submit(question: string) {
    setStage("schema");
    setCypher("");
    setEnvelope("");
    setError("");
    try {
      const result = await naturalLanguageToCypher(question, setStage);
      setCypher(result.cypher);
      if (result.error) setError(result.error);
      else acceptResult(result.envelope);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setStage(null);
    }
  }

  function acceptResult(resultEnvelope: string) {
    setEnvelope(resultEnvelope);
    onEnvelope(resultEnvelope);
  }

  return { stage, cypher, envelope, error, submit };
}
