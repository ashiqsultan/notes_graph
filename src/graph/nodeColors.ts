const FIXED_COLORS = new Map<string, string>([
  ["Note", "#4ade80"],
  ["Entity", "#fde047"],
  ["Person", "#60a5fa"],
  ["Place", "#f472b6"],
  ["Date_Time", "#a78bfa"],
  ["Technology", "#38bdf8"],
]);

const PALETTE = [
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#84cc16",
  "#f97316",
];
const UNLABELED_COLOR = "#9ca3af";

/** Every node type with a fixed color, for the graph legend. */
export const LEGEND_ENTRIES = Array.from(FIXED_COLORS, ([label, color]) => ({
  label,
  color,
}));

/** Returns the color for a node type. The same label always gets the same color. */
export function colorForLabel(label: string | undefined): string {
  if (!label) return UNLABELED_COLOR;
  return FIXED_COLORS.get(label) ?? PALETTE[hashLabel(label) % PALETTE.length];
}

function hashLabel(label: string): number {
  let hash = 0;
  for (const char of label) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}
