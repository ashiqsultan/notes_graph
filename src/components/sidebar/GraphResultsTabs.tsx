import { ResultRowsView } from "@/components/sidebar/ResultRowsView";
import { SidebarGraphCanvas } from "@/components/sidebar/SidebarGraphCanvas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GraphData } from "@/graph/relateElements";

interface GraphResultsTabsProps {
  graph: GraphData;
  rows: unknown[];
  onSelectNode: (nodeId: number) => void;
}

/** Shows the query result as a graph, with the JSON of its rows on another tab. */
function GraphResultsTabs({ graph, rows, onSelectNode }: GraphResultsTabsProps) {
  return (
    <Tabs defaultValue="graph" className="min-h-0 min-w-0 flex-1">
      <TabsList>
        <TabsTrigger value="graph">Visualization</TabsTrigger>
        <TabsTrigger value="json">JSON</TabsTrigger>
      </TabsList>
      <TabsContent value="graph" className="flex min-h-0 flex-1 flex-col">
        <SidebarGraphCanvas graph={graph} className="h-auto min-h-0 flex-1" onSelectNode={onSelectNode} />
      </TabsContent>
      <TabsContent value="json" className="flex min-h-0 flex-1 flex-col">
        <ResultRowsView rows={rows} />
      </TabsContent>
    </Tabs>
  );
}

export { GraphResultsTabs };
