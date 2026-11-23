import { useEffect, useState } from "react";
import { NOTE_TYPES_QUERY } from "@/graph/noteTypesQuery";
import { readNoteTypes } from "@/graph/readNoteTypes";
import { runCypher } from "@/graph/relateClient";
import { useNotesStore } from "@/store";

/** Returns the node types linked to each note, reloading whenever the graph changes. */
export function useNoteTypes(): Map<number, string[]> {
  const graphVersion = useNotesStore((state) => state.graphVersion);
  const [noteTypes, setNoteTypes] = useState<Map<number, string[]>>(new Map());

  useEffect(() => {
    let active = true;
    runCypher(NOTE_TYPES_QUERY)
      .then((text) => {
        if (active) setNoteTypes(readNoteTypes(text));
      })
      .catch(() => {
        if (active) setNoteTypes(new Map());
      });
    return () => {
      active = false;
    };
  }, [graphVersion]);

  return noteTypes;
}
