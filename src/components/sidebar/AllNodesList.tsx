import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useGraphList } from "@/hooks/use-graph-list";
import { ALL_NODES_QUERY } from "@/graph/sidebarQueries";

interface AllNodesListProps {
  onSelect: (nodeId: string) => void;
}

/** Lists every node in the graph. Clicking one shows it with its relations. */
function AllNodesList({ onSelect }: AllNodesListProps) {
  const { graph, loading, error } = useGraphList(ALL_NODES_QUERY);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (graph.nodes.length === 0) return <p className="text-sm text-muted-foreground">No nodes</p>;

  return (
    <ScrollArea className="h-60">
      <SidebarMenu>
        {graph.nodes.map((node) => (
          <SidebarMenuItem key={node.id}>
            <SidebarMenuButton onClick={() => onSelect(node.id)}>
              {node.caption ?? node.id}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </ScrollArea>
  );
}

export { AllNodesList };
