import { useFileStore } from "../stores/fileStore";
import { useConfigStore } from "../stores/configStore";
import { useUiStore } from "../stores/uiStore";
import { useEditorStore } from "../stores/editorStore";
import { FileTree } from "./FileTree";
import { api } from "../api";
import { useCallback } from "react";

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
    async (parentDir: string) => {
      const name = prompt("File name (e.g. note.md):");
      if (!name || !workspaceDir) return;
      try {
        await api.createFile(parentDir, name);
        await refreshTree();
      } catch (e) {
        console.error("Failed to create file:", e);
      }
    },
    [workspaceDir, refreshTree],
  );

  const handleRename = useCallback(
    async (oldPath: string) => {
      const newName = prompt("New name:");
      if (!newName || !workspaceDir) return;
      try {
        await api.renameFile(oldPath, newName);
        await refreshTree();
      } catch (e) {
        console.error("Failed to rename:", e);
      }
    },
    [workspaceDir, refreshTree],
  );

  const handleDelete = useCallback(
    async (path: string) => {
      if (!confirm(`Delete ${path}?`)) return;
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
    <aside className="w-56 border-r border-border bg-muted/10 flex flex-col shrink-0">
      <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border flex justify-between items-center">
        <span className="truncate">{workspaceDir.split("/").pop()}</span>
        <button
          title="New file"
          onClick={() => handleCreate(workspaceDir)}
          className="hover:bg-muted rounded p-0.5"
        >
          + New
        </button>
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
    </aside>
  );
}
