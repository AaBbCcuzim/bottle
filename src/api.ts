import { invoke } from "@tauri-apps/api/core";
import type { FileEntry, SearchResult } from "./types";

export const api = {
  openFile: (path: string): Promise<string> =>
    invoke("open_file", { path }),

  saveFile: (path: string, content: string): Promise<void> =>
    invoke("save_file", { path, content }),

  listDir: (path: string): Promise<FileEntry[]> =>
    invoke("list_dir", { path }),

  createFile: (parentDir: string, name: string): Promise<string> =>
    invoke("create_file", { parentDir, name }),

  renameFile: (oldPath: string, newName: string): Promise<string> =>
    invoke("rename_file", { oldPath, newName }),

  deleteFile: (path: string): Promise<void> =>
    invoke("delete_file", { path }),

  saveImage: (
    data: number[],
    filename: string,
    workspaceDir: string,
  ): Promise<string> =>
    invoke("save_image", { data, filename, workspaceDir }),

  searchFiles: (dir: string, query: string): Promise<SearchResult[]> =>
    invoke("search_files", { dir, query }),

  exportHtml: (markdown: string, destPath: string): Promise<void> =>
    invoke("export_html", { markdown, destPath }),

  exportPdf: (markdown: string, destPath: string): Promise<void> =>
    invoke("export_pdf", { markdown, destPath }),
};
