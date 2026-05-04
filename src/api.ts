import { invoke } from "@tauri-apps/api/core";
import type { FileEntry, AppConfig, SearchResult } from "./types";

export const api = {
  openFile: (path: string): Promise<string> =>
    invoke("open_file", { path }),

  saveFile: (path: string, content: string): Promise<void> =>
    invoke("save_file", { path, content }),

  listDir: (path: string, extensions: string[]): Promise<FileEntry> =>
    invoke("list_dir", { path, extensions }),

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

  indexFile: (dir: string, filePath: string, content: string): Promise<void> =>
    invoke("index_file", { dir, filePath, content }),

  exportHtml: (markdown: string, destPath: string): Promise<void> =>
    invoke("export_html", { markdown, destPath }),

  exportPdf: (markdown: string, destPath: string): Promise<void> =>
    invoke("export_pdf", { markdown, destPath }),

  getConfig: (): Promise<AppConfig> =>
    invoke("get_config"),

  setConfig: (config: AppConfig): Promise<void> =>
    invoke("set_config", { config }),
};
