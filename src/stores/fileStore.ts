import { create } from "zustand";
import type { FileEntry } from "../types";

interface FileState {
  fileTree: FileEntry[];
  activeFilePath: string | null;
  workspaceDir: string | null;
  openRecent: string[];
  setFileTree: (tree: FileEntry[]) => void;
  setActiveFile: (path: string | null) => void;
  setWorkspace: (dir: string) => void;
  closeWorkspace: () => void;
  addRecent: (path: string) => void;
}

export const useFileStore = create<FileState>((set) => ({
  fileTree: [],
  activeFilePath: null,
  workspaceDir: null,
  openRecent: [],
  setFileTree: (tree) => set({ fileTree: tree }),
  setActiveFile: (path) => set({ activeFilePath: path }),
  setWorkspace: (dir) => set({ workspaceDir: dir }),
  closeWorkspace: () =>
    set({ fileTree: [], activeFilePath: null, workspaceDir: null }),
  addRecent: (path) =>
    set((s) => {
      const filtered = s.openRecent.filter((p) => p !== path);
      const next = [path, ...filtered].slice(0, 10);
      return { openRecent: next };
    }),
}));
