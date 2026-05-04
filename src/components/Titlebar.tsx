import { useEffect, useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { confirm } from "@tauri-apps/plugin-dialog";
import { useUiStore } from "../stores/uiStore";
import { useEditorStore } from "../stores/editorStore";

function TitlebarWindows() {
  const isMaximized = useUiStore((s) => s.isMaximized);
  const setIsMaximized = useUiStore((s) => s.setIsMaximized);
  const window = getCurrentWindow();

  const handleMinimize = useCallback(() => {
    window.minimize();
  }, []);

  const handleMaximize = useCallback(() => {
    window.toggleMaximize();
  }, []);

  const handleClose = useCallback(async () => {
    if (useEditorStore.getState().isDirty) {
      const shouldClose = await confirm(
        "You have unsaved changes. Close anyway?",
        { title: "Unsaved Changes", kind: "warning" }
      );
      if (!shouldClose) return;
    }
    await window.close();
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    window.startDragging();
  }, []);

  const handleDoubleClick = useCallback(() => {
    window.toggleMaximize();
  }, []);

  useEffect(() => {
    const init = async () => {
      const maximized = await window.isMaximized();
      setIsMaximized(maximized);
    };
    init();

    const unlisten = window.onResized(async () => {
      const maximized = await window.isMaximized();
      setIsMaximized(maximized);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return (
    <div
      className="flex items-center h-[32px] shrink-0 select-none bg-background text-foreground border-b border-border pl-3 pr-0"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <span className="text-xs font-medium text-muted-foreground truncate">
        bottle
      </span>

      <div className="flex-1" />

      <div className="flex h-full">
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-[46px] h-full hover:bg-muted active:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
            <rect width="10" height="1" rx="0.5" />
          </svg>
        </button>

        <button
          onClick={handleMaximize}
          className="flex items-center justify-center w-[46px] h-full hover:bg-muted active:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="1.5" y="3.5" width="6" height="6" rx="0.5" />
              <path d="M2.5 3.5V2A0.5 0.5 0 0 1 3 1.5H8A0.5 0.5 0 0 1 8.5 2V7A0.5 0.5 0 0 1 8 7.5H6.5" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="1" y="1" width="8" height="8" rx="0.8" />
            </svg>
          )}
        </button>

        <button
          onClick={handleClose}
          className="flex items-center justify-center w-[46px] h-full hover:bg-destructive hover:text-destructive-foreground active:bg-destructive/80 text-muted-foreground transition-colors"
          aria-label="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function Titlebar() {
  const platform = useUiStore((s) => s.platform);

  if (platform === "windows") {
    return <TitlebarWindows />;
  }

  return null;
}
