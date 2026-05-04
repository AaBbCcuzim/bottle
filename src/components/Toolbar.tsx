import { useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useUiStore } from "../stores/uiStore";

export function Toolbar() {
  const platform = useUiStore((s) => s.platform);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (platform !== "macos") return;
    const target = e.target as HTMLElement;
    if (target.closest("button, input, select, textarea, a")) return;
    getCurrentWindow().startDragging();
  }, [platform]);

  if (platform !== "macos") return null;

  return (
    <div
      className="h-[28px] shrink-0 select-none flex items-center pl-[72px] pr-2"
      onMouseDown={handleMouseDown}
    />
  );
}
