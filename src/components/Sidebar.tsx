import { useFileStore } from "../stores/fileStore";
import { useConfigStore } from "../stores/configStore";
import { useEditorStore } from "../stores/editorStore";
import { FileTree } from "./FileTree";
import { api } from "../api";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { confirm as tauriConfirm } from "@tauri-apps/plugin-dialog";
import { Plus, FolderOpen } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription } from "../components/ui/empty";

type PromptAction = { title: string; placeholder: string; onSubmit: (value: string) => void } | null;

export function Sidebar() {
  const fileTree = useFileStore((s) => s.fileTree);
  const activeFilePath = useFileStore((s) => s.activeFilePath);
  const workspaceDir = useFileStore((s) => s.workspaceDir);
  const setActiveFile = useFileStore((s) => s.setActiveFile);
  const setCurrentDoc = useEditorStore((s) => s.setCurrentDoc);
  const addRecent = useFileStore((s) => s.addRecent);
  const setFileTree = useFileStore((s) => s.setFileTree);
  const fileExtensions = useConfigStore((s) => s.fileExtensions);
  const { t } = useTranslation();
  const [promptAction, setPromptAction] = useState<PromptAction>(null);
  const [inputValue, setInputValue] = useState("");

  const refreshTree = useCallback(async () => {
    if (!workspaceDir) return;
    try {
      const root = await api.listDir(workspaceDir, fileExtensions);
      setFileTree(root);
    } catch (e) {
      console.error("Failed to list directory:", e);
    }
  }, [workspaceDir, fileExtensions, setFileTree]);

  const handleSelect = useCallback(
    async (path: string) => {
      try {
        const content = await api.openFile(path);
        setActiveFile(path);
        setCurrentDoc(content, path);
        addRecent(path);
      } catch (e) {
        console.error("Failed to open file:", e);
      }
    },
    [setActiveFile, setCurrentDoc, addRecent],
  );

  const handleCreate = useCallback(
    (parentDir: string) => {
      setPromptAction({
        title: t("newFile"),
        placeholder: t("fileName"),
        onSubmit: async (name) => {
          if (!name || !workspaceDir) return;
          try {
            await api.createFile(parentDir, name);
            await refreshTree();
          } catch (e) {
            console.error("Failed to create file:", e);
          }
        },
      });
    },
    [workspaceDir, refreshTree],
  );

  const handleRename = useCallback(
    (oldPath: string) => {
      setPromptAction({
        title: "Rename",
        placeholder: "New name",
        onSubmit: async (newName) => {
          if (!newName || !workspaceDir) return;
          try {
            await api.renameFile(oldPath, newName);
            await refreshTree();
          } catch (e) {
            console.error("Failed to rename:", e);
          }
        },
      });
    },
    [workspaceDir, refreshTree],
  );

  const handleDelete = useCallback(
    async (path: string) => {
      const ok = await tauriConfirm(`Delete ${path}?`, { title: "Delete File", kind: "warning" });
      if (!ok) return;
      try {
        await api.deleteFile(path);
        await refreshTree();
        if (activeFilePath === path) {
          useEditorStore.getState().clearDoc();
        }
      } catch (e) {
        console.error("Failed to delete:", e);
      }
    },
    [workspaceDir, activeFilePath, refreshTree],
  );

  if (!workspaceDir) return null;

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" title={t("newFile")} onClick={() => handleCreate(workspaceDir)}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {fileTree?.children?.length ? (
          <FileTree
            files={fileTree.children}
            activePath={activeFilePath}
            onSelect={handleSelect}
            onCreate={handleCreate}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        ) : (
          <Empty>
            <EmptyIcon>
              <FolderOpen />
            </EmptyIcon>
            <EmptyTitle>{t("emptyFolder")}</EmptyTitle>
            <EmptyDescription>{t("emptyFolderHint")}</EmptyDescription>
          </Empty>
        )}
      </SidebarContent>

      {promptAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setPromptAction(null)}
        >
          <div className="fixed inset-0 bg-black/40" />
          <div
            className="relative z-10 bg-background border border-border rounded-lg shadow-xl p-4 w-72"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-medium mb-3">{promptAction.title}</h3>
            <Input
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="mb-3"
              placeholder={promptAction.placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  promptAction.onSubmit(inputValue);
                  setPromptAction(null);
                  setInputValue("");
                }
                if (e.key === "Escape") {
                  setPromptAction(null);
                  setInputValue("");
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setPromptAction(null); setInputValue(""); }}>Cancel</Button>
              <Button size="sm" onClick={() => { promptAction.onSubmit(inputValue); setPromptAction(null); setInputValue(""); }}>OK</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
