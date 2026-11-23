import { useEffect, useRef } from "react";
import { NVL } from "@neo4j-nvl/base";
import { DragNodeInteraction, PanInteraction, ZoomInteraction } from "@neo4j-nvl/interaction-handlers";
import { cn } from "cn";
import type { GraphData } from "@/graph/relateElements";

interface SidebarGraphCanvasProps {
  graph: GraphData;
  className?: string;
}

/** Draws the graph inside the sidebar with NVL. The drawing is rebuilt whenever the graph changes. */
function SidebarGraphCanvas({ graph, className }: SidebarGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || graph.nodes.length === 0) return;
    return mountGraph(container, graph);
  }, [graph]);

  return (
    <div className={cn("relative h-[360px] w-full rounded-md border", className)}>
      <div ref={containerRef} className="h-full w-full" />
      {graph.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          No nodes to draw
        </div>
      )}
    </div>
  );
}

/** Mounts NVL with pan, zoom and drag; returns the teardown function. */
function mountGraph(container: HTMLElement, graph: GraphData): () => void {
  const nvl = new NVL(
    container,
    graph.nodes,
    graph.rels,
    { layout: "forceDirected" },
    { onLayoutDone: () => fitAllNodes(nvl, graph) },
  );
  const handlers = [new PanInteraction(nvl), new ZoomInteraction(nvl), new DragNodeInteraction(nvl)];
  return () => {
    handlers.forEach((handler) => handler.destroy());
    nvl.destroy();
  };
}

function fitAllNodes(nvl: NVL, graph: GraphData): void {
  nvl.fit(graph.nodes.map((node) => node.id));
}

export { SidebarGraphCanvas };
