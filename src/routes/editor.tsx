import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFileStore } from "../stores/fileStore";
import { useConfigStore } from "../stores/configStore";
import { useUiStore } from "../stores/uiStore";
import { Sidebar } from "../components/Sidebar";
import { Editor } from "../components/Editor";
import { Button } from "../components/ui/button";
import { PanelLeft } from "lucide-react";
import { api } from "../api";

function EditorPage() {
  const workspaceDir = useFileStore((s) => s.workspaceDir);
  const activeFilePath = useFileStore((s) => s.activeFilePath);
  const fileExtensions = useConfigStore((s) => s.fileExtensions);
  const setFileTree = useFileStore((s) => s.setFileTree);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const { t } = useTranslation();
  const [sidebarWidth, setSidebarWidth] = useState(224);
  const dragging = useRef(false);

  useEffect(() => {
    if (!workspaceDir) return;
    api.listDir(workspaceDir, fileExtensions).then(setFileTree).catch(console.error);
  }, [fileExtensions, workspaceDir, setFileTree]);

  const handleMouseDown = useCallback(() => {
    dragging.current = true;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setSidebarWidth(Math.max(160, Math.min(480, e.clientX)));
    };
    const handleMouseUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="flex flex-1 overflow-hidden">
      {sidebarOpen && workspaceDir && (
        <>
          <div style={{ width: sidebarWidth }} className="shrink-0">
            <Sidebar />
          </div>
          <div
            className="w-0.5 shrink-0 cursor-col-resize relative
              before:absolute before:inset-y-0 before:-left-1 before:right-1"
            onMouseDown={handleMouseDown}
          />
        </>
      )}
      <main className="flex-1 flex flex-col text-muted-foreground overflow-hidden relative">
        {!sidebarOpen && workspaceDir && (
          <Button variant="ghost" size="icon" title={t("showSidebar")} onClick={toggleSidebar} className="absolute top-2 left-2 z-10">
            <PanelLeft size={16} />
          </Button>
        )}
        <Editor key={activeFilePath} />
      </main>
    </div>
  );
}

export const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/editor",
  component: EditorPage,
});
