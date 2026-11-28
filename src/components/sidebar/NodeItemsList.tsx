import { ScrollArea } from "@/components/ui/scroll-area";
import { nodeName, nodeType } from "@/graph/nodeItems";
import type { RelateNode } from "@/graph/relateElements";
import { colorForLabel } from "@/graph/nodeColors";

interface NodeItemsListProps {
  nodes: RelateNode[];
  onSelectNode: (nodeId: number) => void;
}

/** A scrollable list of the nodes in the current result. Clicking one shows its direct connections. */
function NodeItemsList({ nodes, onSelectNode }: NodeItemsListProps) {
  if (nodes.length === 0) return <p className="text-sm text-muted-foreground">No nodes</p>;

  return (
    <ScrollArea className="h-64 rounded-md border">
      <ul className="flex flex-col gap-1 p-2">
        {nodes.map((node) => (
          <li key={node.id}>
            <button
              type="button"
              onClick={() => onSelectNode(node.id)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: colorForLabel(nodeType(node)) }}
              />
              <span className="truncate">{nodeName(node)}</span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">{nodeType(node)}</span>
            </button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}

export { NodeItemsList };
