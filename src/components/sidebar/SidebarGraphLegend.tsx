import { LEGEND_ENTRIES } from "@/graph/nodeColors";

/** Lists each node type with a dot in its color, so the graph colors can be read. */
function SidebarGraphLegend() {
  return (
    <ul className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {LEGEND_ENTRIES.map(({ label, color }) => (
        <li key={label} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          {label}
        </li>
      ))}
    </ul>
  );
}

export { SidebarGraphLegend };
