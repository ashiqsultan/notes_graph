import type { PointerEvent } from "react";

type SidebarResizeHandleProps = {
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
};

export function SidebarResizeHandle({ onPointerDown }: SidebarResizeHandleProps) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      onPointerDown={onPointerDown}
      className="absolute inset-y-0 right-0 z-20 hidden w-1 cursor-col-resize hover:bg-sidebar-border md:block"
    />
  );
}
