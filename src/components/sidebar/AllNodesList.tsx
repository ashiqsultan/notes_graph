import { NodeTypePill } from "@/components/sidebar/NodeTypePill";
import { useNodeTypes } from "@/hooks/use-node-types";

interface AllNodesListProps {
  onSelectType: (type: string) => void;
}

/** Shows a pill for each node type in the graph. Clicking one shows every node of that type. */
function AllNodesList({ onSelectType }: AllNodesListProps) {
  const { types, loading, error } = useNodeTypes();

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (types.length === 0) return <p className="text-sm text-muted-foreground">No nodes</p>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {types.map((type) => (
        <NodeTypePill key={type} type={type} onSelect={onSelectType} />
      ))}
    </div>
  );
}

export { AllNodesList };
