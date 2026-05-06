import { createRoute, useNavigate } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import { useEffect } from "react";
import { useFileStore } from "../stores/fileStore";
import { useEditorStore } from "../stores/editorStore";
import { useConfigStore } from "../stores/configStore";
import { Sidebar } from "../components/Sidebar";
import { Editor } from "../components/Editor";
import { StatusBar } from "../components/StatusBar";
import {
  SidebarProvider,
  Sidebar as ShadcnSidebar,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "../components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "../components/ui/context-menu";
import { Ellipsis, Settings, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription } from "../components/ui/empty";
import { api } from "../api";

function EditorLayout() {
  const currentFilePath = useEditorStore((s) => s.currentFilePath);
  const workspaceDir = useFileStore((s) => s.workspaceDir);
  const { open } = useSidebar();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <ShadcnSidebar
        collapsible="none"
        className="overflow-hidden shrink-0 transition-[width] duration-200 ease-linear"
        style={{ width: open && workspaceDir ? 'var(--sidebar-width, 16rem)' : '0px' }}
      >
        <Sidebar />
      </ShadcnSidebar>
      <SidebarInset className="overflow-hidden relative">
        {workspaceDir && (
          <SidebarTrigger
            className="absolute top-2 left-4 z-10 transition-all duration-200 ease-linear"
            style={{
              opacity: open ? 0 : 1,
              pointerEvents: open ? 'none' : 'auto',
              transform: open ? 'translateX(-8px)' : 'translateX(0)',
            }}
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="absolute top-2 right-4 z-10">
                <Ellipsis size={16} />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
              <Settings size={14} />
              {t("settings")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ContextMenu>
          <ContextMenuTrigger className="flex-1 overflow-hidden">
            {currentFilePath ? (
              <Editor key={currentFilePath} />
            ) : (
              <Empty>
                <EmptyIcon>
                  <FileText />
                </EmptyIcon>
                <EmptyTitle>{t("noFileOpen")}</EmptyTitle>
                <EmptyDescription>{t("selectFileHint")}</EmptyDescription>
              </Empty>
            )}
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => navigate({ to: "/settings" })}>
              <Settings size={14} />
              {t("settings")}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <StatusBar />
      </SidebarInset>
    </>
  );
}

function EditorPage() {
  const workspaceDir = useFileStore((s) => s.workspaceDir);
  const fileExtensions = useConfigStore((s) => s.fileExtensions);
  const setFileTree = useFileStore((s) => s.setFileTree);

  useEffect(() => {
    if (!workspaceDir) return;
    api.listDir(workspaceDir, fileExtensions).then(setFileTree).catch(console.error);
  }, [fileExtensions, workspaceDir, setFileTree]);

  return (
    <SidebarProvider className="flex-1 min-h-0">
      <EditorLayout />
    </SidebarProvider>
  );
}

export const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/editor",
  component: EditorPage,
});
