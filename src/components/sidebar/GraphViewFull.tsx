import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AllNodesList } from "@/components/sidebar/AllNodesList";
import { SidebarGraphCanvas } from "@/components/sidebar/SidebarGraphCanvas";
import { SidebarShowAllButton } from "@/components/sidebar/SidebarShowAllButton";
import type { GraphData } from "@/graph/relateElements";

interface GraphViewFullProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  graph: GraphData;
  running: boolean;
  onShowAll: () => void;
  onSelectType: (type: string) => void;
}

/** Large dialog showing a full-size graph canvas with its show all button and node type filters. */
function GraphViewFull({ open, onOpenChange, graph, running, onShowAll, onSelectType }: GraphViewFullProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[95vw] max-w-none grid-rows-[auto_minmax(0,1fr)] sm:max-w-none">
        <DialogHeader>
          <DialogTitle>Graph view</DialogTitle>
          {/*<DialogDescription>Full-size view of the sidebar graph.</DialogDescription>*/}
        </DialogHeader>
        <div className="flex min-h-0 flex-col">
          <div className="mb-4 flex align-middle gap-2">
            <SidebarShowAllButton onClick={onShowAll} disabled={running} />
            <AllNodesList onSelectType={onSelectType} />
          </div>
          <SidebarGraphCanvas graph={graph} className="min-h-0 flex-1" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { GraphViewFull };
