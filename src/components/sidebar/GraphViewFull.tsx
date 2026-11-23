import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarGraphCanvas } from "@/components/sidebar/SidebarGraphCanvas";
import { SidebarGraphLegend } from "@/components/sidebar/SidebarGraphLegend";
import type { GraphData } from "@/graph/relateElements";

interface GraphViewFullProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  graph: GraphData;
}

/** Large dialog showing a full-size graph canvas with its legend. */
function GraphViewFull({ open, onOpenChange, graph }: GraphViewFullProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[95vw] max-w-none grid-rows-[auto_minmax(0,1fr)] sm:max-w-none">
        <DialogHeader>
          <DialogTitle>Graph view</DialogTitle>
          <DialogDescription>Full-size view of the sidebar graph.</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-col">
          <SidebarGraphLegend />
          <SidebarGraphCanvas graph={graph} className="min-h-0 flex-1" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { GraphViewFull };
