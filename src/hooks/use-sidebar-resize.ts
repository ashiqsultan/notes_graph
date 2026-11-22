import { useCallback, useState, type PointerEvent } from "react";

type SidebarResizeOptions = {
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
};

export function clampWidth(width: number, minWidth: number, maxWidth: number) {
  return Math.min(maxWidth, Math.max(minWidth, width));
}

function stopResizing(handleMove: (event: globalThis.PointerEvent) => void) {
  window.removeEventListener("pointermove", handleMove);
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
}

export function useSidebarResize({
  defaultWidth = 256,
  minWidth = 200,
  maxWidth = 480,
}: SidebarResizeOptions = {}) {
  const [width, setWidth] = useState(() =>
    clampWidth(defaultWidth, minWidth, maxWidth)
  );

  const startResize = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      event.preventDefault();
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const handleMove = (moveEvent: globalThis.PointerEvent) => {
        setWidth(clampWidth(moveEvent.clientX, minWidth, maxWidth));
      };
      const handleUp = () => {
        stopResizing(handleMove);
        window.removeEventListener("pointerup", handleUp);
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [minWidth, maxWidth]
  );

  return { width, startResize };
}
