import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarGraphCanvas } from "@/components/sidebar/SidebarGraphCanvas";
import type { GraphData } from "@/graph/relateElements";

interface GraphViewFullProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  graph: GraphData;
  children: ReactNode;
}

/** Large dialog showing the sidebar controls beside a full-size graph canvas. */
function GraphViewFull({ open, onOpenChange, graph, children }: GraphViewFullProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[95vw] max-w-none grid-rows-[auto_minmax(0,1fr)] sm:max-w-none">
        <DialogHeader>
          <DialogTitle>Graph view</DialogTitle>
          <DialogDescription>Full-size view of the sidebar graph.</DialogDescription>
        </DialogHeader>
        <div className="grid min-h-0 grid-cols-[320px_minmax(0,1fr)] gap-4">
          <div className="flex min-h-0 flex-col gap-2 overflow-y-auto p-1">{children}</div>
          <SidebarGraphCanvas graph={graph} className="h-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { GraphViewFull };
