import { useFileStore } from "../stores/fileStore";
import { useConfigStore } from "../stores/configStore";
import { useUiStore } from "../stores/uiStore";
import { useEditorStore } from "../stores/editorStore";
import { FileTree } from "./FileTree";
import { api } from "../api";
import { useCallback, useState, useRef } from "react";
import { confirm as tauriConfirm } from "@tauri-apps/plugin-dialog";
import { Settings, Plus, PanelLeft } from "lucide-react";

type PromptAction = { title: string; placeholder: string; onSubmit: (value: string) => void } | null;

export function Sidebar() {
  const fileTree = useFileStore((s) => s.fileTree);
  const activeFilePath = useFileStore((s) => s.activeFilePath);
  const workspaceDir = useFileStore((s) => s.workspaceDir);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setActiveFile = useFileStore((s) => s.setActiveFile);
  const setCurrentDoc = useEditorStore((s) => s.setCurrentDoc);
  const addRecent = useFileStore((s) => s.addRecent);
  const setFileTree = useFileStore((s) => s.setFileTree);
  const fileExtensions = useConfigStore((s) => s.fileExtensions);
  const [promptAction, setPromptAction] = useState<PromptAction>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        title: "New File",
        placeholder: "File name (e.g. note.md)",
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

  if (!sidebarOpen || !workspaceDir) return null;

  return (
    <aside className="w-full bg-muted/10 flex flex-col h-full border-r border-border">
      <div className="px-1 py-2 text-xs font-medium text-muted-foreground flex justify-end items-center">
        <div className="flex items-center gap-0.5">
          <button
            title="New file"
            onClick={() => handleCreate(workspaceDir)}
            className="hover:bg-muted rounded-md p-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            title="Close sidebar"
            onClick={() => useUiStore.getState().toggleSidebar()}
            className="hover:bg-muted rounded-md p-1.5"
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <FileTree
          files={fileTree?.children ?? []}
          activePath={activeFilePath}
          onSelect={handleSelect}
          onCreate={handleCreate}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      </div>
      <div className="flex items-center justify-end px-1 py-1.5 text-muted-foreground">
        <button
          title="Settings"
          onClick={() => useUiStore.getState().setPage("settings")}
          className="hover:bg-muted rounded-md p-1.5 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

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
            <input
              ref={inputRef}
              autoFocus
              className="w-full px-3 py-1.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary mb-3"
              placeholder={promptAction.placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  promptAction.onSubmit((e.target as HTMLInputElement).value);
                  setPromptAction(null);
                }
                if (e.key === "Escape") {
                  setPromptAction(null);
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPromptAction(null)}
                className="px-3 py-1 text-sm rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = inputRef.current?.value ?? "";
                  promptAction.onSubmit(val);
                  setPromptAction(null);
                }}
                className="px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
