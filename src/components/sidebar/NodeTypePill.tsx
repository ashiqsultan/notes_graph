import { colorForLabel } from "@/graph/nodeColors";

interface NodeTypePillProps {
  type: string;
  onSelect: (type: string) => void;
}

/** A pill in the node type's color. Clicking it shows every node of that type. */
function NodeTypePill({ type, onSelect }: NodeTypePillProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className="rounded-full px-2.5 py-1 text-xs font-medium text-slate-900 transition-opacity hover:opacity-80"
      style={{ backgroundColor: colorForLabel(type) }}
    >
      {type}
    </button>
  );
}

export { NodeTypePill };
