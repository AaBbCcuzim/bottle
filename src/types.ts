export interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  children: FileEntry[];
}

export interface AppConfig {
  file_extensions: string[];
}

export type EditMode = "source" | "split" | "wysiwyg";
export type ThemeMode = "light" | "dark" | "system";
export type ActiveModal = "outline" | "search" | "settings" | null;
export type Platform = "macos" | "windows" | "linux" | "unknown";

export interface SearchResult {
  file_path: string;
  snippet: string;
  line_number: number;
}
