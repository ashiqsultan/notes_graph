import { useEffect, useState } from "react";
import { readNodeTypes } from "@/graph/readNodeTypes";
import { runCypher } from "@/graph/relateClient";
import { NODE_TYPES_QUERY } from "@/graph/sidebarQueries";

/** Queries the distinct node types in the graph when mounted. */
export function useNodeTypes() {
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    runCypher(NODE_TYPES_QUERY)
      .then((text) => {
        if (active) setTypes(readNodeTypes(text));
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { types, loading, error };
}
