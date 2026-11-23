import { colorForLabel } from "@/graph/nodeColors";

/** Colored circles, one per node type linked to a note. The type name is available as a tooltip. */
function NoteTypeDots({ types }: { types: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {types.map((type) => (
        <span
          key={type}
          role="img"
          aria-label={type}
          title={type}
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: colorForLabel(type) }}
        />
      ))}
    </div>
  );
}

export { NoteTypeDots };
