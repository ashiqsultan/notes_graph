import type { ReactNode } from "react";
import { NodeTypePill } from "@/components/sidebar/NodeTypePill";
import { useNodeTypes } from "@/hooks/use-node-types";

interface AllNodesListProps {
  onSelectType: (type: string) => void;
  typesVersion: number;
  /** Rendered as the first item in the same row as the type pills. */
  leading?: ReactNode;
}

/** Shows a pill for each node type in the graph. Clicking one shows every node of that type. */
function AllNodesList({ onSelectType, typesVersion, leading }: AllNodesListProps) {
  const { types, loading, error } = useNodeTypes(typesVersion);
  const visibleTypes = loading || error ? [] : types;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {leading}
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && types.length === 0 && (
        <p className="text-sm text-muted-foreground">No nodes</p>
      )}
      {visibleTypes.map((type) => (
        <NodeTypePill key={type} type={type} onSelect={onSelectType} />
      ))}
    </div>
  );
}

export { AllNodesList };
