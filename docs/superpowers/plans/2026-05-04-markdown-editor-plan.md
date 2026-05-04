# Markdown Desktop Editor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cross-platform Markdown desktop editor with Tauri v2 + React + Milkdown, supporting three edit modes, file management workspace, and full-text search.

**Architecture:** Tauri v2 Rust backend handles all filesystem I/O (file CRUD, image save, tantivy search, export). React frontend with Zustand state management delegates file operations to Tauri commands. Milkdown editor is filesystem-agnostic — it receives/outputs markdown strings only. shadcn/ui + Tailwind CSS for minimal, clean UI.

**Tech Stack:** Tauri v2, React 18, TypeScript, Zustand, shadcn/ui, Tailwind CSS, Milkdown 7, tantivy (Rust)

---

### Task 1: Scaffold Tauri + React + Vite Project

**Files:**
- Create: all scaffold files via `npm create tauri-app`

- [ ] **Step 1: Create Tauri project**

```bash
cd /Users/swamer/Documents/ownspace/code/bottle
npm create tauri-app@latest . -- --template react-ts --manager npm
```

Note: If prompted to overwrite existing files, confirm overwrite of the old `.gitignore` and `Readme.md`. The template creates `src/`, `src-tauri/`, `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`.

- [ ] **Step 2: Verify scaffold**

```bash
ls src/ src-tauri/ package.json vite.config.ts
```

Expected: all directories and files exist.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: scaffold Tauri v2 + React + Vite project

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Install Frontend Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install core dependencies**

```bash
cd /Users/swamer/Documents/ownspace/code/bottle
npm install zustand @milkdown/kit @milkdown/plugin-math @milkdown/plugin-diagram @milkdown/plugin-highlight @milkdown/plugin-clipboard @milkdown/plugin-upload @milkdown/theme-nord katex mermaid
```

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D tailwindcss @tailwindcss/vite @types/katex
```

- [ ] **Step 3: Verify install**

```bash
node -e "require('zustand'); require('@milkdown/kit'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install Zustand, Milkdown, Tailwind CSS

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Initialize Tailwind CSS and shadcn/ui

**Files:**
- Modify: `vite.config.ts`
- Create: `src/index.css`

- [ ] **Step 1: Configure Tailwind in Vite**

Modify `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
```

- [ ] **Step 2: Set up global CSS**

Replace `src/index.css` (or `src/styles.css` if that's what the template created):

```css
@import "tailwindcss";
@import "@milkdown/theme-nord/style.css";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --radius: 0.5rem;
}

:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
}

* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

- [ ] **Step 3: Verify Tailwind works**

Start the dev server and check for errors:

```bash
cd /Users/swamer/Documents/ownspace/code/bottle
npx vite build 2>&1 | tail -5
```

- [ ] **Step 4: Add shadcn/ui button component**

Since shadcn/ui CLI may require interactive setup, manually create `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/styles.css vite.config.ts src/lib/ package.json package-lock.json 2>/dev/null
git commit -m "feat: configure Tailwind CSS v4 and shadcn/ui theme

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: Set Up Rust Backend Dependencies

**Files:**
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: Add Rust dependencies**

Edit `src-tauri/Cargo.toml`, add to `[dependencies]`:

```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tantivy = "0.22"
tempfile = "3"
```

- [ ] **Step 2: Set up lib.rs with command registration**

Replace `src-tauri/src/lib.rs`:

```rust
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::open_file,
            commands::save_file,
            commands::list_dir,
            commands::create_file,
            commands::rename_file,
            commands::delete_file,
            commands::save_image,
            commands::search_files,
            commands::export_html,
            commands::export_pdf,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 3: Verify compilation**

```bash
cd /Users/swamer/Documents/ownspace/code/bottle/src-tauri
cargo check 2>&1 | tail -5
```

Expected: errors about missing `commands` module (we'll create it next), but no dependency errors.

- [ ] **Step 4: Commit**

```bash
git add src-tauri/Cargo.toml src-tauri/src/lib.rs
git commit -m "feat: configure Tauri Rust backend with tantivy

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 5: Implement Rust File System Commands

**Files:**
- Create: `src-tauri/src/commands.rs`

- [ ] **Step 1: Write the failing Rust test**

Create `src-tauri/tests/commands_test.rs`:

```rust
// Unit tests will be inline in commands.rs via #[cfg(test)]
```

Actually, create `src-tauri/src/commands.rs` with placeholder and inline tests:

```rust
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
}

#[command]
pub fn open_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[command]
pub fn save_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, &content).map_err(|e| e.to_string())
}

#[command]
pub fn list_dir(path: String) -> Result<Vec<FileEntry>, String> {
    let entries = fs::read_dir(&path).map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().to_string();
        let entry_path = entry.path();
        let is_dir = entry_path.is_dir();
        result.push(FileEntry {
            name,
            path: entry_path.to_string_lossy().to_string(),
            is_dir,
        });
    }
    result.sort_by(|a, b| {
        if a.is_dir != b.is_dir {
            b.is_dir.cmp(&a.is_dir)
        } else {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        }
    });
    Ok(result)
}

#[command]
pub fn create_file(parent_dir: String, name: String) -> Result<String, String> {
    let path = PathBuf::from(&parent_dir).join(&name);
    fs::write(&path, "").map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[command]
pub fn rename_file(old_path: String, new_name: String) -> Result<String, String> {
    let old = PathBuf::from(&old_path);
    let new = old.parent().unwrap_or(&old).join(&new_name);
    fs::rename(&old, &new).map_err(|e| e.to_string())?;
    Ok(new.to_string_lossy().to_string())
}

#[command]
pub fn delete_file(path: String) -> Result<(), String> {
    trash::delete(&path).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_open_file() {
        let dir = TempDir::new().unwrap();
        let file_path = dir.path().join("test.md");
        fs::write(&file_path, "# Hello").unwrap();
        let result = open_file(file_path.to_string_lossy().to_string()).unwrap();
        assert_eq!(result, "# Hello");
    }

    #[test]
    fn test_save_file() {
        let dir = TempDir::new().unwrap();
        let file_path = dir.path().join("test.md");
        let path_str = file_path.to_string_lossy().to_string();
        save_file(path_str.clone(), "# Hello".to_string()).unwrap();
        assert_eq!(fs::read_to_string(&path_str).unwrap(), "# Hello");
    }

    #[test]
    fn test_list_dir() {
        let dir = TempDir::new().unwrap();
        fs::write(dir.path().join("a.md"), "").unwrap();
        fs::create_dir(dir.path().join("sub")).unwrap();
        let result = list_dir(dir.path().to_string_lossy().to_string()).unwrap();
        assert_eq!(result.len(), 2);
        assert!(result[0].is_dir);   // dirs come first
        assert!(!result[1].is_dir);
    }

    #[test]
    fn test_create_file() {
        let dir = TempDir::new().unwrap();
        let path = create_file(
            dir.path().to_string_lossy().to_string(),
            "new.md".to_string(),
        ).unwrap();
        assert!(PathBuf::from(&path).exists());
    }

    #[test]
    fn test_rename_file() {
        let dir = TempDir::new().unwrap();
        let file = dir.path().join("old.md");
        fs::write(&file, "test").unwrap();
        let new_path = rename_file(
            file.to_string_lossy().to_string(),
            "new.md".to_string(),
        ).unwrap();
        assert!(new_path.ends_with("new.md"));
        assert!(!file.exists());
    }
}
```

- [ ] **Step 2: Run tests to see them pass/fail**

```bash
cd /Users/swamer/Documents/ownspace/code/bottle/src-tauri
cargo test 2>&1 | tail -20
```

- [ ] **Step 3: Add `trash` dependency for delete_file**

Add to `src-tauri/Cargo.toml` `[dependencies]`:

```toml
trash = "3"
```

Then run `cargo test` again.

- [ ] **Step 4: Commit**

```bash
git add src-tauri/src/commands.rs src-tauri/Cargo.toml src-tauri/tests/
git commit -m "feat: implement Rust file system commands with tests

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 6: Implement Rust Image and Export Commands

**Files:**
- Modify: `src-tauri/src/commands.rs`

- [ ] **Step 1: Add image save and export commands**

Append to `src-tauri/src/commands.rs`:

```rust
#[command]
pub fn save_image(data: Vec<u8>, filename: String, workspace_dir: String) -> Result<String, String> {
    let images_dir = PathBuf::from(&workspace_dir).join("images");
    fs::create_dir_all(&images_dir).map_err(|e| e.to_string())?;
    let filepath = images_dir.join(&filename);
    fs::write(&filepath, &data).map_err(|e| e.to_string())?;
    Ok(format!("./images/{}", filename))
}

#[command]
pub fn export_html(markdown: String, dest_path: String) -> Result<(), String> {
    let mut html = String::from("<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n");
    html.push_str("<title>Export</title>\n</head>\n<body>\n");
    // Use a simple markdown-to-HTML conversion via comrak
    html.push_str(&markdown_to_html(&markdown));
    html.push_str("\n</body>\n</html>");
    fs::write(&dest_path, &html).map_err(|e| e.to_string())
}

#[command]
pub fn export_pdf(_markdown: String, _dest_path: String) -> Result<(), String> {
    // PDF export requires a rendering engine; defer to a later task
    Err("PDF export not yet implemented".to_string())
}

fn markdown_to_html(md: &str) -> String {
    use comrak::{markdown_to_html_with_plugins, ComrakOptions, ComrakPlugins};
    let options = ComrakOptions::default();
    let plugins = ComrakPlugins::default();
    markdown_to_html_with_plugins(md, &options, &plugins)
}
```

- [ ] **Step 2: Add comrak dependency**

Add to `src-tauri/Cargo.toml` `[dependencies]`:

```toml
comrak = "0.29"
```

- [ ] **Step 3: Add tests**

Append inside `#[cfg(test)] mod tests {` in `src-tauri/src/commands.rs`:

```rust
#[test]
fn test_save_image() {
    let dir = TempDir::new().unwrap();
    let result = save_image(
        vec![1, 2, 3],
        "test.png".to_string(),
        dir.path().to_string_lossy().to_string(),
    ).unwrap();
    assert_eq!(result, "./images/test.png");
    let saved_path = dir.path().join("images").join("test.png");
    assert!(saved_path.exists());
}

#[test]
fn test_export_html() {
    let dir = TempDir::new().unwrap();
    let dest = dir.path().join("out.html");
    export_html(
        "# Hello".to_string(),
        dest.to_string_lossy().to_string(),
    ).unwrap();
    let content = fs::read_to_string(&dest).unwrap();
    assert!(content.contains("<h1>Hello</h1>"));
}
```

- [ ] **Step 4: Run tests**

```bash
cd /Users/swamer/Documents/ownspace/code/bottle/src-tauri
cargo test 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/commands.rs src-tauri/Cargo.toml
git commit -m "feat: add Rust image save and HTML export commands

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 7: Create TypeScript Types and Tauri API Wrapper

**Files:**
- Create: `src/types.ts`
- Create: `src/api.ts`

- [ ] **Step 1: Write type definitions**

Create `src/types.ts`:

```typescript
export interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
}

export type EditMode = "source" | "split" | "wysiwyg";
export type ThemeMode = "light" | "dark" | "system";
export type ActiveModal = "outline" | "search" | "settings" | null;

export interface SearchResult {
  file_path: string;
  snippet: string;
  line_number: number;
}
```

- [ ] **Step 2: Write Tauri API wrapper**

Create `src/api.ts`:

```typescript
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
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/swamer/Documents/ownspace/code/bottle
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/api.ts
git commit -m "feat: add TypeScript types and Tauri API wrapper

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 8: Create UI Zustand Store

**Files:**
- Create: `src/stores/uiStore.ts`

- [ ] **Step 1: Write failing test**

Create `src/stores/__tests__/uiStore.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { useUiStore } from "../uiStore";

describe("uiStore", () => {
  beforeEach(() => {
    useUiStore.setState({
      theme: "system",
      sidebarOpen: true,
      activeModal: null,
    });
  });

  it("toggles theme", () => {
    useUiStore.getState().setTheme("dark");
    expect(useUiStore.getState().theme).toBe("dark");
  });

  it("toggles sidebar", () => {
    expect(useUiStore.getState().sidebarOpen).toBe(true);
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(false);
  });

  it("sets active modal", () => {
    useUiStore.getState().setActiveModal("search");
    expect(useUiStore.getState().activeModal).toBe("search");
    useUiStore.getState().setActiveModal(null);
    expect(useUiStore.getState().activeModal).toBeNull();
  });

  it("closes modal when setting same modal", () => {
    useUiStore.getState().setActiveModal("outline");
    useUiStore.getState().setActiveModal("outline");
    expect(useUiStore.getState().activeModal).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/swamer/Documents/ownspace/code/bottle
npx vitest run src/stores/__tests__/uiStore.test.ts 2>&1 | tail -10
```

- [ ] **Step 3: Implement uiStore**

Create `src/stores/uiStore.ts`:

```typescript
import { create } from "zustand";
import type { ThemeMode, ActiveModal } from "../types";

interface UiState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  activeModal: ActiveModal;
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  setActiveModal: (modal: ActiveModal) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: "system",
  sidebarOpen: true,
  activeModal: null,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveModal: (modal) =>
    set((s) => ({ activeModal: s.activeModal === modal ? null : modal })),
}));
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/stores/__tests__/uiStore.test.ts 2>&1 | tail -10
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/stores/uiStore.ts src/stores/__tests__/uiStore.test.ts
git commit -m "feat: create UI Zustand store with theme/sidebar/modal state

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 9: Create Editor Zustand Store

**Files:**
- Create: `src/stores/editorStore.ts`

- [ ] **Step 1: Write failing test**

Create `src/stores/__tests__/editorStore.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "../editorStore";

describe("editorStore", () => {
  beforeEach(() => {
    useEditorStore.setState({
      currentDoc: "",
      currentFilePath: null,
      editMode: "wysiwyg",
      isDirty: false,
    });
  });

  it("sets current document", () => {
    useEditorStore.getState().setCurrentDoc("# Hello", "/tmp/test.md");
    expect(useEditorStore.getState().currentDoc).toBe("# Hello");
    expect(useEditorStore.getState().currentFilePath).toBe("/tmp/test.md");
    expect(useEditorStore.getState().isDirty).toBe(false);
  });

  it("marks dirty on content change", () => {
    useEditorStore.getState().setCurrentDoc("# Hello", "/tmp/test.md");
    useEditorStore.getState().markDirty();
    expect(useEditorStore.getState().isDirty).toBe(true);
  });

  it("changes edit mode", () => {
    useEditorStore.getState().setEditMode("source");
    expect(useEditorStore.getState().editMode).toBe("source");
    useEditorStore.getState().setEditMode("split");
    expect(useEditorStore.getState().editMode).toBe("split");
    useEditorStore.getState().setEditMode("wysiwyg");
    expect(useEditorStore.getState().editMode).toBe("wysiwyg");
  });

  it("clears dirty flag on save", () => {
    useEditorStore.getState().setCurrentDoc("# Hello", "/tmp/test.md");
    useEditorStore.getState().markDirty();
    expect(useEditorStore.getState().isDirty).toBe(true);
    useEditorStore.getState().markClean();
    expect(useEditorStore.getState().isDirty).toBe(false);
  });
});
```

- [ ] **Step 2: Implement editorStore**

Create `src/stores/editorStore.ts`:

```typescript
import { create } from "zustand";
import type { EditMode } from "../types";

interface EditorState {
  currentDoc: string;
  currentFilePath: string | null;
  editMode: EditMode;
  isDirty: boolean;
  setCurrentDoc: (doc: string, path: string | null) => void;
  updateDoc: (doc: string) => void;
  setEditMode: (mode: EditMode) => void;
  markDirty: () => void;
  markClean: () => void;
  clearDoc: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentDoc: "",
  currentFilePath: null,
  editMode: "wysiwyg",
  isDirty: false,
  setCurrentDoc: (doc, path) =>
    set({ currentDoc: doc, currentFilePath: path, isDirty: false }),
  updateDoc: (doc) => set({ currentDoc: doc, isDirty: true }),
  setEditMode: (mode) => set({ editMode: mode }),
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),
  clearDoc: () =>
    set({ currentDoc: "", currentFilePath: null, isDirty: false }),
}));
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run src/stores/__tests__/editorStore.test.ts 2>&1 | tail -15
```

Expected: 4 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/stores/editorStore.ts src/stores/__tests__/editorStore.test.ts
git commit -m "feat: create editor Zustand store with doc/mode/dirty state

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 10: Create File Zustand Store

**Files:**
- Create: `src/stores/fileStore.ts`

- [ ] **Step 1: Write failing test**

Create `src/stores/__tests__/fileStore.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useFileStore } from "../fileStore";

// Mock Tauri API
vi.mock("../../api", () => ({
  api: {
    openFile: vi.fn().mockResolvedValue("# mock content"),
    saveFile: vi.fn().mockResolvedValue(undefined),
    listDir: vi.fn().mockResolvedValue([
      { name: "notes", path: "/ws/notes", is_dir: true },
      { name: "readme.md", path: "/ws/readme.md", is_dir: false },
    ]),
    createFile: vi.fn().mockResolvedValue("/ws/new.md"),
    renameFile: vi.fn().mockResolvedValue("/ws/renamed.md"),
    deleteFile: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("fileStore", () => {
  beforeEach(() => {
    useFileStore.setState({
      fileTree: [],
      activeFilePath: null,
      workspaceDir: null,
      openRecent: [],
    });
  });

  it("sets workspace", () => {
    useFileStore.getState().setWorkspace("/Users/test/notes");
    expect(useFileStore.getState().workspaceDir).toBe("/Users/test/notes");
  });

  it("adds to recent files (dedup + max 10)", () => {
    const store = useFileStore.getState();
    store.addRecent("/a.md");
    store.addRecent("/b.md");
    store.addRecent("/a.md"); // duplicate, should move to front
    expect(useFileStore.getState().openRecent).toEqual(["/a.md", "/b.md"]);
  });

  it("caps recent files at 10", () => {
    const store = useFileStore.getState();
    for (let i = 0; i < 15; i++) {
      store.addRecent(`/file${i}.md`);
    }
    expect(useFileStore.getState().openRecent.length).toBe(10);
  });

  it("clears file state on close workspace", () => {
    useFileStore.setState({
      fileTree: [{ name: "a.md", path: "/a.md", is_dir: false }],
      activeFilePath: "/a.md",
    });
    useFileStore.getState().closeWorkspace();
    const s = useFileStore.getState();
    expect(s.fileTree).toEqual([]);
    expect(s.activeFilePath).toBeNull();
    expect(s.workspaceDir).toBeNull();
  });
});
```

- [ ] **Step 2: Implement fileStore**

Create `src/stores/fileStore.ts`:

```typescript
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
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run src/stores/__tests__/fileStore.test.ts 2>&1 | tail -15
```

Expected: 4 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/stores/fileStore.ts src/stores/__tests__/fileStore.test.ts
git commit -m "feat: create file Zustand store with fileTree/workspace/recent state

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 11: Implement Theme Provider and Dark Mode

**Files:**
- Create: `src/components/ThemeProvider.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Write failing test**

Create `src/components/__tests__/ThemeProvider.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeProvider";
import { useUiStore } from "../../stores/uiStore";

function TestChild() {
  return <div data-testid="child">test</div>;
}

describe("ThemeProvider", () => {
  it("adds dark class when theme is dark", () => {
    useUiStore.getState().setTheme("dark");
    render(
      <ThemeProvider>
        <TestChild />
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes dark class when theme is light", () => {
    useUiStore.getState().setTheme("light");
    render(
      <ThemeProvider>
        <TestChild />
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
```

- [ ] **Step 2: Implement ThemeProvider**

Create `src/components/ThemeProvider.tsx`:

```typescript
import { useEffect, type ReactNode } from "react";
import { useUiStore } from "../stores/uiStore";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useUiStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // system
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const apply = () => root.classList.toggle("dark", mq.matches);
      apply();
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  return <>{children}</>;
}
```

- [ ] **Step 3: Install React Testing Library**

```bash
npm install -D @testing-library/react @testing-library/jest-dom jsdom
```

Add to `vite.config.ts`:

```typescript
/// <reference types="vitest" />
```

And append after the `defineConfig` block:

```typescript
  test: {
    environment: "jsdom",
    globals: true,
  },
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/components/__tests__/ThemeProvider.test.tsx 2>&1 | tail -15
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ThemeProvider.tsx src/components/__tests__/ vite.config.ts package.json package-lock.json
git commit -m "feat: implement ThemeProvider with light/dark/system support

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 12: Set Up App Layout Shell

**Files:**
- Modify: `src/main.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: Update main.tsx**

Replace `src/main.tsx`:

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 2: Create App.tsx with layout shell**

Create `src/App.tsx`:

```typescript
import { ThemeProvider } from "./components/ThemeProvider";

function App() {
  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <div className="flex flex-1 overflow-hidden">
          {/* Layout will be filled in by subsequent tasks */}
          <main className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <p className="text-lg">Open a file or folder to get started</p>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
```

- [ ] **Step 3: Verify app compiles**

```bash
cd /Users/swamer/Documents/ownspace/code/bottle
npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/main.tsx src/App.tsx
git commit -m "feat: create App layout shell with ThemeProvider

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 13: Create Toolbar Component

**Files:**
- Create: `src/components/Toolbar.tsx`

- [ ] **Step 1: Write failing test**

Create `src/components/__tests__/Toolbar.test.tsx`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toolbar } from "../Toolbar";
import { useUiStore } from "../../stores/uiStore";
import { useEditorStore } from "../../stores/editorStore";

describe("Toolbar", () => {
  beforeEach(() => {
    useUiStore.setState({ theme: "light", activeModal: null });
    useEditorStore.setState({ editMode: "wysiwyg", currentDoc: "" });
  });

  it("renders edit mode buttons", () => {
    render(<Toolbar />);
    expect(screen.getByText("Source")).toBeTruthy();
    expect(screen.getByText("Split")).toBeTruthy();
    expect(screen.getByText("WYSIWYG")).toBeTruthy();
  });

  it("calls setEditMode on mode button click", () => {
    render(<Toolbar />);
    fireEvent.click(screen.getByText("Source"));
    expect(useEditorStore.getState().editMode).toBe("source");
  });

  it("opens search modal", () => {
    render(<Toolbar />);
    fireEvent.click(screen.getByTitle("Search"));
    expect(useUiStore.getState().activeModal).toBe("search");
  });

  it("opens outline modal", () => {
    render(<Toolbar />);
    fireEvent.click(screen.getByTitle("Outline"));
    expect(useUiStore.getState().activeModal).toBe("outline");
  });
});
```

- [ ] **Step 2: Implement Toolbar**

Create `src/components/Toolbar.tsx`:

```typescript
import { useEditorStore } from "../stores/editorStore";
import { useUiStore } from "../stores/uiStore";
import type { EditMode } from "../types";

const modes: { mode: EditMode; label: string }[] = [
  { mode: "source", label: "Source" },
  { mode: "split", label: "Split" },
  { mode: "wysiwyg", label: "WYSIWYG" },
];

export function Toolbar() {
  const editMode = useEditorStore((s) => s.editMode);
  const setEditMode = useEditorStore((s) => s.setEditMode);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const setActiveModal = useUiStore((s) => s.setActiveModal);

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-muted/30">
      {/* Edit mode switcher */}
      <div className="flex rounded-md border border-border overflow-hidden">
        {modes.map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setEditMode(mode)}
            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
              editMode === mode
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        title="Toggle theme"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-1.5 rounded hover:bg-muted text-sm"
      >
        {theme === "dark" ? "☀" : "☾"}
      </button>

      {/* Outline */}
      <button
        title="Outline"
        onClick={() => setActiveModal("outline")}
        className="p-1.5 rounded hover:bg-muted text-sm"
      >
        ☰
      </button>

      {/* Search */}
      <button
        title="Search"
        onClick={() => setActiveModal("search")}
        className="p-1.5 rounded hover:bg-muted text-sm"
      >
        ⌕
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run src/components/__tests__/Toolbar.test.tsx 2>&1 | tail -15
```

Expected: 4 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/Toolbar.tsx src/components/__tests__/Toolbar.test.tsx
git commit -m "feat: create Toolbar with edit mode switcher and action buttons

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 14: Create StatusBar Component

**Files:**
- Create: `src/components/StatusBar.tsx`

- [ ] **Step 1: Write test**

Create `src/components/__tests__/StatusBar.test.tsx`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBar } from "../StatusBar";
import { useEditorStore } from "../../stores/editorStore";

describe("StatusBar", () => {
  beforeEach(() => {
    useEditorStore.setState({
      currentDoc: "Hello\nWorld",
      currentFilePath: "/tmp/test.md",
      editMode: "wysiwyg",
    });
  });

  it("renders word count", () => {
    render(<StatusBar />);
    expect(screen.getByText(/words: 2/i)).toBeTruthy();
  });

  it("renders line count", () => {
    render(<StatusBar />);
    expect(screen.getByText(/lines: 2/i)).toBeTruthy();
  });

  it("renders file path", () => {
    render(<StatusBar />);
    expect(screen.getByText("/tmp/test.md")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Implement StatusBar**

Create `src/components/StatusBar.tsx`:

```typescript
import { useEditorStore } from "../stores/editorStore";
import { useMemo } from "react";

export function StatusBar() {
  const currentDoc = useEditorStore((s) => s.currentDoc);
  const currentFilePath = useEditorStore((s) => s.currentFilePath);
  const editMode = useEditorStore((s) => s.editMode);

  const stats = useMemo(() => {
    const lines = currentDoc ? currentDoc.split("\n").length : 0;
    const words = currentDoc
      ? currentDoc.trim().split(/\s+/).filter(Boolean).length
      : 0;
    return { lines, words };
  }, [currentDoc]);

  return (
    <div className="flex items-center gap-4 px-3 py-1 border-t border-border bg-muted/30 text-xs text-muted-foreground">
      <span>Words: {stats.words}</span>
      <span>Lines: {stats.lines}</span>
      <span className="uppercase">{editMode}</span>
      <span className="flex-1 text-right truncate">
        {currentFilePath || "No file open"}
      </span>
    </div>
  );
}
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run src/components/__tests__/StatusBar.test.tsx 2>&1 | tail -15
```

Expected: 3 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/StatusBar.tsx src/components/__tests__/StatusBar.test.tsx
git commit -m "feat: create StatusBar with word count, lines, mode, path

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 15: Create Sidebar with FileTree

**Files:**
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/FileTree.tsx`

- [ ] **Step 1: Write test for FileTree**

Create `src/components/__tests__/FileTree.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileTree } from "../FileTree";
import type { FileEntry } from "../../types";

const mockFiles: FileEntry[] = [
  { name: "notes", path: "/ws/notes", is_dir: true },
  { name: "readme.md", path: "/ws/readme.md", is_dir: false },
  { name: "todo.md", path: "/ws/todo.md", is_dir: false },
];

describe("FileTree", () => {
  it("renders files and directories", () => {
    render(
      <FileTree
        files={mockFiles}
        activePath={null}
        onSelect={vi.fn()}
        onCreate={vi.fn()}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("notes")).toBeTruthy();
    expect(screen.getByText("readme.md")).toBeTruthy();
    expect(screen.getByText("todo.md")).toBeTruthy();
  });

  it("calls onSelect when clicking a file", () => {
    const onSelect = vi.fn();
    render(
      <FileTree
        files={mockFiles}
        activePath={null}
        onSelect={onSelect}
        onCreate={vi.fn()}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("readme.md"));
    expect(onSelect).toHaveBeenCalledWith("/ws/readme.md");
  });

  it("highlights active file", () => {
    render(
      <FileTree
        files={mockFiles}
        activePath="/ws/readme.md"
        onSelect={vi.fn()}
        onCreate={vi.fn()}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    // The active file button should have a different class
    const btn = screen.getByText("readme.md").closest("button");
    expect(btn?.className).toContain("bg-muted");
  });
});
```

- [ ] **Step 2: Implement FileTree**

Create `src/components/FileTree.tsx`:

```typescript
import { useState } from "react";
import type { FileEntry } from "../types";

interface FileTreeProps {
  files: FileEntry[];
  activePath: string | null;
  onSelect: (path: string) => void;
  onCreate: (parentDir: string) => void;
  onRename: (oldPath: string) => void;
  onDelete: (path: string) => void;
}

export function FileTree({
  files,
  activePath,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: FileTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <div className="flex flex-col py-1">
      {files.map((file) => (
        <div key={file.path}>
          {file.is_dir ? (
            <>
              <button
                onClick={() =>
                  setExpanded((e) => ({ ...e, [file.path]: !e[file.path] }))
                }
                className="flex items-center gap-1 w-full px-3 py-1 text-sm hover:bg-muted text-left"
              >
                <span className="text-xs w-3">
                  {expanded[file.path] ? "▾" : "▸"}
                </span>
                <span>📁 {file.name}</span>
              </button>
              {expanded[file.path] && (
                <div className="text-xs text-muted-foreground px-5 py-0.5">
                  (expandable in future)
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => onSelect(file.path)}
              className={`flex items-center gap-1 w-full px-3 py-1 text-sm hover:bg-muted text-left ${
                activePath === file.path ? "bg-muted" : ""
              }`}
            >
              <span className="text-xs w-3" />
              <span>📄 {file.name}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run src/components/__tests__/FileTree.test.tsx 2>&1 | tail -15
```

Expected: 3 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/FileTree.tsx src/components/__tests__/FileTree.test.tsx
git commit -m "feat: create FileTree component with expandable directories

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 16: Create Sidebar Container and Wire Layout

**Files:**
- Create: `src/components/Sidebar.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement Sidebar**

Create `src/components/Sidebar.tsx`:

```typescript
import { useFileStore } from "../stores/fileStore";
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
        const filePath = await api.createFile(parentDir, name);
        const tree = await api.listDir(workspaceDir);
        setFileTree(tree);
        handleSelect(filePath);
      } catch (e) {
        console.error("Failed to create file:", e);
      }
    },
    [workspaceDir, setFileTree, handleSelect],
  );

  const handleRename = useCallback(
    async (oldPath: string) => {
      const newName = prompt("New name:");
      if (!newName || !workspaceDir) return;
      try {
        await api.renameFile(oldPath, newName);
        const tree = await api.listDir(workspaceDir);
        setFileTree(tree);
      } catch (e) {
        console.error("Failed to rename:", e);
      }
    },
    [workspaceDir, setFileTree],
  );

  const handleDelete = useCallback(
    async (path: string) => {
      if (!confirm(`Delete ${path}?`)) return;
      try {
        await api.deleteFile(path);
        const tree = await api.listDir(workspaceDir!);
        setFileTree(tree);
        if (activeFilePath === path) {
          useEditorStore.getState().clearDoc();
        }
      } catch (e) {
        console.error("Failed to delete:", e);
      }
    },
    [workspaceDir, activeFilePath, setFileTree],
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
          files={fileTree}
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
```

- [ ] **Step 2: Update App.tsx with full layout**

Replace `src/App.tsx`:

```typescript
import { ThemeProvider } from "./components/ThemeProvider";
import { Toolbar } from "./components/Toolbar";
import { StatusBar } from "./components/StatusBar";
import { Sidebar } from "./components/Sidebar";
import { useFileStore } from "./stores/fileStore";
import { useEditorStore } from "./stores/editorStore";
import { api } from "./api";
import { useEffect } from "react";

function App() {
  const workspaceDir = useFileStore((s) => s.workspaceDir);
  const setWorkspace = useFileStore((s) => s.setWorkspace);
  const setFileTree = useFileStore((s) => s.setFileTree);
  const currentDoc = useEditorStore((s) => s.currentDoc);

  // Listen for file open events from Tauri (system file association)
  useEffect(() => {
    // Tauri file drop / open handler will go here
  }, []);

  const handleOpenFolder = async () => {
    // Will use Tauri dialog in a future task; for now, prompt
    const dir = prompt("Enter workspace folder path:");
    if (!dir) return;
    setWorkspace(dir);
    try {
      const tree = await api.listDir(dir);
      setFileTree(tree);
    } catch (e) {
      console.error("Failed to open folder:", e);
    }
  };

  const handleOpenFile = async () => {
    const path = prompt("Enter file path:");
    if (!path) return;
    try {
      const content = await api.openFile(path);
      useEditorStore.getState().setCurrentDoc(content, path);
      useFileStore.getState().addRecent(path);
    } catch (e) {
      console.error("Failed to open file:", e);
    }
  };

  const handleSave = async () => {
    const { currentDoc, currentFilePath, markClean } = useEditorStore.getState();
    if (!currentFilePath) return;
    try {
      await api.saveFile(currentFilePath, currentDoc);
      markClean();
    } catch (e) {
      console.error("Failed to save:", e);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if (mod && e.key === "o" && !e.shiftKey) {
        e.preventDefault();
        useEditorStore.getState().currentDoc
          ? handleSave()
          : useFileStore.getState().workspaceDir
            ? null
            : null;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <Toolbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            {currentDoc ? (
              <div className="w-full h-full p-4 font-mono text-sm whitespace-pre-wrap overflow-auto">
                {currentDoc}
              </div>
            ) : (
              <div className="flex flex-col gap-3 items-center">
                <p className="text-lg">Markdown Editor</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleOpenFile}
                    className="px-4 py-2 rounded-md border border-border hover:bg-muted text-sm"
                  >
                    Open File
                  </button>
                  <button
                    onClick={handleOpenFolder}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-sm"
                  >
                    Open Folder
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
        <StatusBar />
      </div>
    </ThemeProvider>
  );
}

export default App;
```

- [ ] **Step 3: Verify app builds**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Sidebar.tsx src/App.tsx
git commit -m "feat: create Sidebar container and wire full layout with shortcuts

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 17: Integrate Milkdown Editor (WYSIWYG Mode)

**Files:**
- Create: `src/components/Editor.tsx`

- [ ] **Step 1: Create Milkdown editor component (WYSIWYG mode first)**

Create `src/components/Editor.tsx`:

```typescript
import { useEffect, useRef } from "react";
import { Editor as MilkdownEditor, rootCtx, defaultValueCtx } from "@milkdown/kit/core";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";
import { nord } from "@milkdown/theme-nord";
import { clipboard } from "@milkdown/kit/plugin/clipboard";
import { history } from "@milkdown/kit/plugin/history";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { useEditorStore } from "../stores/editorStore";
import { useCallback } from "react";

export function Editor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MilkdownEditor | null>(null);
  const currentDoc = useEditorStore((s) => s.currentDoc);
  const editMode = useEditorStore((s) => s.editMode);

  const createEditor = useCallback(async () => {
    if (!containerRef.current || editorRef.current) return;

    const editor = await MilkdownEditor.make()
      .config((ctx) => {
        ctx.set(rootCtx, containerRef.current!);
        ctx.set(defaultValueCtx, currentDoc);
        ctx.get(listenerCtx).markdownUpdated((_, md) => {
          useEditorStore.getState().updateDoc(md);
        });
      })
      .use(nord)
      .use(commonmark)
      .use(gfm)
      .use(history)
      .use(clipboard)
      .use(listener)
      .create();

    editorRef.current = editor;
  }, []);

  useEffect(() => {
    createEditor();
    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, [createEditor]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-auto"
      data-edit-mode={editMode}
    />
  );
}
```

- [ ] **Step 2: Integrate Editor into App.tsx**

In `src/App.tsx`, replace the placeholder content area:

After importing `Editor`:
```typescript
import { Editor } from "./components/Editor";
```

In the JSX, replace:
```tsx
{currentDoc ? (
  <div className="w-full h-full p-4 font-mono text-sm whitespace-pre-wrap overflow-auto">
    {currentDoc}
  </div>
) : (
  ...
)}
```

With:
```tsx
{currentDoc ? (
  <Editor />
) : (
  ...
)}
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -15
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Editor.tsx src/App.tsx
git commit -m "feat: integrate Milkdown editor with WYSIWYG mode

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 18: Implement Source-Only and Split Edit Modes

**Files:**
- Modify: `src/components/Editor.tsx`

- [ ] **Step 1: Update Editor to support all three modes**

Replace `src/components/Editor.tsx`:

```typescript
import { useEffect, useRef, useState } from "react";
import {
  Editor as MilkdownEditor,
  rootCtx,
  defaultValueCtx,
} from "@milkdown/kit/core";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";
import { nord } from "@milkdown/theme-nord";
import { clipboard } from "@milkdown/kit/plugin/clipboard";
import { history } from "@milkdown/kit/plugin/history";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { useEditorStore } from "../stores/editorStore";
import { useCallback } from "react";

export function Editor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<MilkdownEditor | null>(null);
  const currentDoc = useEditorStore((s) => s.currentDoc);
  const editMode = useEditorStore((s) => s.editMode);
  const [, forceRender] = useState(0);

  const createEditor = useCallback(async () => {
    if (!containerRef.current || editorRef.current) return;

    const editor = await MilkdownEditor.make()
      .config((ctx) => {
        ctx.set(rootCtx, containerRef.current!);
        ctx.set(defaultValueCtx, currentDoc);
        ctx.get(listenerCtx).markdownUpdated((_, md) => {
          useEditorStore.getState().updateDoc(md);
        });
      })
      .use(nord)
      .use(commonmark)
      .use(gfm)
      .use(history)
      .use(clipboard)
      .use(listener)
      .create();

    editorRef.current = editor;
    forceRender(1);
  }, []);

  useEffect(() => {
    createEditor();
    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, [createEditor]);

  // Handle source textarea changes
  const handleSourceChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      useEditorStore.getState().updateDoc(e.target.value);
    },
    [],
  );

  // Split mode: render markdown to HTML for preview
  const previewHtml = useEditorStore((s) => s.currentDoc);

  if (editMode === "source") {
    return (
      <textarea
        ref={sourceRef}
        value={currentDoc}
        onChange={handleSourceChange}
        className="w-full h-full p-4 font-mono text-sm bg-muted/10 resize-none outline-none border-0"
        spellCheck={false}
      />
    );
  }

  if (editMode === "split") {
    return (
      <div className="flex w-full h-full">
        <textarea
          value={currentDoc}
          onChange={handleSourceChange}
          className="w-1/2 h-full p-4 font-mono text-sm bg-muted/10 resize-none outline-none border-r border-border"
          spellCheck={false}
        />
        <div className="w-1/2 h-full overflow-auto p-4 prose prose-sm dark:prose-invert max-w-none">
          {/* Preview rendered by Milkdown in a future task */}
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {previewHtml}
          </pre>
        </div>
      </div>
    );
  }

  // WYSIWYG mode
  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-auto"
      data-edit-mode="wysiwyg"
    />
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Editor.tsx
git commit -m "feat: implement source-only and split edit modes

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 19: Add Milkdown Plugins (Math, Diagram, Highlight)

**Files:**
- Modify: `src/components/Editor.tsx`

- [ ] **Step 1: Add plugin imports and usage**

In `src/components/Editor.tsx`, add imports:

```typescript
import { math } from "@milkdown/plugin-math";
import { diagram } from "@milkdown/plugin-diagram";
import { highlight, highlightPluginConfig } from "@milkdown/plugin-highlight";
import { createParser } from "@milkdown/plugin-highlight/shiki";
```

Update `createEditor` to include plugins. Replace the `.use()` chain:

```typescript
const createEditor = useCallback(async () => {
  if (!containerRef.current || editorRef.current) return;

  const parser = await createParser({
    theme: "github-dark",
    langs: [
      "javascript", "typescript", "python", "rust", "html", "css",
      "json", "yaml", "bash", "sql", "markdown", "java", "go", "c", "cpp",
    ],
  });

  const editor = await MilkdownEditor.make()
    .config((ctx) => {
      ctx.set(rootCtx, containerRef.current!);
      ctx.set(defaultValueCtx, currentDoc);
      ctx.set(highlightPluginConfig.key, { parser });
      ctx.get(listenerCtx).markdownUpdated((_, md) => {
        useEditorStore.getState().updateDoc(md);
      });
    })
    .use(nord)
    .use(commonmark)
    .use(gfm)
    .use(history)
    .use(clipboard)
    .use(listener)
    .use(math)
    .use(diagram)
    .use(highlight)
    .create();

  editorRef.current = editor;
  forceRender(1);
}, []);
```

- [ ] **Step 2: Add KaTeX CSS**

In `src/index.css`, add at the top:

```css
@import "katex/dist/katex.min.css";
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -15
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Editor.tsx src/index.css
git commit -m "feat: add Math (KaTeX), Mermaid diagram, and Shiki code highlighting plugins

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 20: Implement Image Paste Handler

**Files:**
- Modify: `src/components/Editor.tsx`

- [ ] **Step 1: Add image paste handler to the WYSIWYG editor**

Add to `Editor.tsx` — a clipboard paste handler that intercepts images:

```typescript
import { upload } from "@milkdown/plugin-upload";
```

And configure the upload plugin in the `.use()` chain:

```typescript
.use(upload.configure(uploadPluginConfig, {
  uploader: async (files: File[]) => {
    const workspaceDir = useFileStore.getState().workspaceDir;
    if (!workspaceDir) throw new Error("No workspace open");
    const results: string[] = [];
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const data = Array.from(new Uint8Array(buffer));
      const relativePath = await api.saveImage(
        data,
        file.name,
        workspaceDir,
      );
      results.push(relativePath);
    }
    return results;
  },
}))
```

Need to import `uploadPluginConfig`:
```typescript
import { upload, uploadPluginConfig } from "@milkdown/plugin-upload";
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Editor.tsx
git commit -m "feat: add image paste handler with Tauri backend storage

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 21: Create Outline (TOC) Modal

**Files:**
- Create: `src/components/OutlineModal.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement OutlineModal**

Create `src/components/OutlineModal.tsx`:

```typescript
import { useMemo, useCallback } from "react";
import { useUiStore } from "../stores/uiStore";
import { useEditorStore } from "../stores/editorStore";

interface TocItem {
  level: number;
  text: string;
  line: number;
}

function extractHeadings(md: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: i,
      });
    }
  }
  return headings;
}

export function OutlineModal() {
  const activeModal = useUiStore((s) => s.activeModal);
  const setActiveModal = useUiStore((s) => s.setActiveModal);
  const currentDoc = useEditorStore((s) => s.currentDoc);

  const headings = useMemo(() => extractHeadings(currentDoc), [currentDoc]);

  const handleJump = useCallback(
    (line: number) => {
      // Scroll to heading in the editor — delegate to Milkdown view
      setActiveModal(null);
    },
    [setActiveModal],
  );

  if (activeModal !== "outline") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div
        className="fixed inset-0 bg-black/20"
        onClick={() => setActiveModal(null)}
      />
      <div className="relative z-10 w-80 max-h-96 overflow-y-auto rounded-lg border border-border bg-background shadow-lg p-4">
        <h2 className="text-sm font-semibold mb-3">Outline</h2>
        {headings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No headings found</p>
        ) : (
          <ul className="space-y-0.5">
            {headings.map((h, i) => (
              <li
                key={i}
                onClick={() => handleJump(h.line)}
                className="text-sm hover:bg-muted rounded px-2 py-0.5 cursor-pointer truncate"
                style={{ paddingLeft: `${8 + (h.level - 1) * 12}px` }}
              >
                {h.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire into App.tsx**

Add import and component to `src/App.tsx`:

```typescript
import { OutlineModal } from "./components/OutlineModal";
```

And add `<OutlineModal />` before the closing `</ThemeProvider>`.

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/components/OutlineModal.tsx src/App.tsx
git commit -m "feat: create Outline/TOC modal with heading hierarchy

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 22: Create Search Modal

**Files:**
- Create: `src/components/SearchModal.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement SearchModal**

Create `src/components/SearchModal.tsx`:

```typescript
import { useState, useCallback, useRef, useEffect } from "react";
import { useUiStore } from "../stores/uiStore";
import { useEditorStore } from "../stores/editorStore";
import { api } from "../api";
import type { SearchResult } from "../types";

export function SearchModal() {
  const activeModal = useUiStore((s) => s.activeModal);
  const setActiveModal = useUiStore((s) => s.setActiveModal);
  const currentDoc = useEditorStore((s) => s.currentDoc);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"current" | "global">("current");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [localResults, setLocalResults] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeModal === "search") {
      inputRef.current?.focus();
      setQuery("");
      setResults([]);
      setLocalResults([]);
    }
  }, [activeModal]);

  // Local search within current document
  const searchLocal = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setLocalResults([]);
        return;
      }
      const lines = currentDoc.split("\n");
      const matches: number[] = [];
      const lower = q.toLowerCase();
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(lower)) {
          matches.push(i);
        }
      }
      setLocalResults(matches);
    },
    [currentDoc],
  );

  // Global search via Tauri backend
  const searchGlobal = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      // Use current file's directory or workspace dir
      const dir =
        useEditorStore.getState().currentFilePath?.split("/").slice(0, -1).join("/") ||
        "/";
      try {
        const r = await api.searchFiles(dir, q);
        setResults(r);
      } catch {
        setResults([]);
      }
    },
    [],
  );

  const handleQuery = useCallback(
    (q: string) => {
      setQuery(q);
      if (tab === "current") searchLocal(q);
      else searchGlobal(q);
    },
    [tab, searchLocal, searchGlobal],
  );

  if (activeModal !== "search") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div
        className="fixed inset-0 bg-black/20"
        onClick={() => setActiveModal(null)}
      />
      <div className="relative z-10 w-[32rem] max-h-[32rem] flex flex-col rounded-lg border border-border bg-background shadow-lg">
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab("current")}
            className={`flex-1 py-2 text-sm font-medium ${
              tab === "current"
                ? "bg-muted text-foreground"
                : "text-muted-foreground"
            }`}
          >
            Current File
          </button>
          <button
            onClick={() => setTab("global")}
            className={`flex-1 py-2 text-sm font-medium ${
              tab === "global"
                ? "bg-muted text-foreground"
                : "text-muted-foreground"
            }`}
          >
            Global Search
          </button>
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleQuery(e.target.value)}
          placeholder={tab === "current" ? "Search current file..." : "Search all files..."}
          className="px-4 py-2 border-b border-border bg-transparent outline-none text-sm"
        />
        <div className="flex-1 overflow-y-auto p-2">
          {tab === "current"
            ? localResults.map((line) => (
                <div
                  key={line}
                  className="px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer font-mono"
                >
                  <span className="text-muted-foreground mr-2">{line + 1}</span>
                  {currentDoc.split("\n")[line].substring(0, 120)}
                </div>
              ))
            : results.map((r, i) => (
                <div
                  key={i}
                  className="px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer"
                >
                  <div className="font-medium truncate">{r.file_path}</div>
                  <div className="text-muted-foreground text-xs truncate">
                    {r.snippet}
                  </div>
                </div>
              ))}
          {query &&
            tab === "current" &&
            localResults.length === 0 && (
              <p className="text-sm text-muted-foreground p-2">No matches</p>
            )}
          {query &&
            tab === "global" &&
            results.length === 0 && (
              <p className="text-sm text-muted-foreground p-2">No matches</p>
            )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire into App.tsx**

Add:
```typescript
import { SearchModal } from "./components/SearchModal";
```

And add `<SearchModal />` before closing `</ThemeProvider>`.

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/components/SearchModal.tsx src/App.tsx
git commit -m "feat: create Search modal with current file and global search tabs

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 23: Create Settings Modal

**Files:**
- Create: `src/components/SettingsModal.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement SettingsModal**

Create `src/components/SettingsModal.tsx`:

```typescript
import { useUiStore } from "../stores/uiStore";
import { useEditorStore } from "../stores/editorStore";
import type { ThemeMode, EditMode } from "../types";

const themes: { mode: ThemeMode; label: string }[] = [
  { mode: "light", label: "Light" },
  { mode: "dark", label: "Dark" },
  { mode: "system", label: "System" },
];

const modes: { mode: EditMode; label: string }[] = [
  { mode: "wysiwyg", label: "WYSIWYG" },
  { mode: "split", label: "Split" },
  { mode: "source", label: "Source" },
];

export function SettingsModal() {
  const activeModal = useUiStore((s) => s.activeModal);
  const setActiveModal = useUiStore((s) => s.setActiveModal);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const editMode = useEditorStore((s) => s.editMode);
  const setEditMode = useEditorStore((s) => s.setEditMode);

  if (activeModal !== "settings") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div
        className="fixed inset-0 bg-black/20"
        onClick={() => setActiveModal(null)}
      />
      <div className="relative z-10 w-80 rounded-lg border border-border bg-background shadow-lg p-6 space-y-5">
        <h2 className="text-sm font-semibold">Settings</h2>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">
            Theme
          </label>
          <div className="flex rounded-md border border-border overflow-hidden">
            {themes.map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={`flex-1 py-1.5 text-xs ${
                  theme === mode
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">
            Default Edit Mode
          </label>
          <div className="flex rounded-md border border-border overflow-hidden">
            {modes.map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => setEditMode(mode)}
                className={`flex-1 py-1.5 text-xs ${
                  editMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire into App.tsx**

Add:
```typescript
import { SettingsModal } from "./components/SettingsModal";
```

And add `<SettingsModal />` before closing `</ThemeProvider>`. Also add a settings button to the Toolbar or wire `Ctrl+,` shortcut:

In `src/App.tsx`, add to keyboard handler:
```typescript
if (mod && e.key === ",") {
  e.preventDefault();
  useUiStore.getState().setActiveModal("settings");
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/components/SettingsModal.tsx src/App.tsx
git commit -m "feat: create Settings modal with theme and default edit mode

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 24: Implement Tantivy Full-Text Search (Rust)

**Files:**
- Create: `src-tauri/src/search.rs`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src-tauri/src/commands.rs`

- [ ] **Step 1: Create search module**

Create `src-tauri/src/search.rs`:

```rust
use serde::Serialize;
use std::path::Path;
use std::sync::Mutex;
use tantivy::collector::TopDocs;
use tantivy::query::QueryParser;
use tantivy::schema::{Schema, TextOptions, STORED, TEXT};
use tantivy::{doc, Index, IndexReader, IndexWriter, ReloadPolicy};
use std::collections::HashMap;

#[derive(Debug, Serialize, Clone)]
pub struct SearchResult {
    pub file_path: String,
    pub snippet: String,
    pub line_number: u32,
}

pub struct SearchState {
    index: Index,
    reader: IndexReader,
    _writer: IndexWriter,
}

impl SearchState {
    pub fn open_or_create(dir: &Path) -> Result<Self, String> {
        let index_path = dir.join(".mdsearch_index");
        let mut schema_builder = Schema::builder();
        let title = schema_builder.add_text_field("title", TEXT);
        let body = schema_builder.add_text_field("body", TEXT);
        let path = schema_builder.add_text_field("path", STORED);
        let schema = schema_builder.build();

        let index = if index_path.exists() {
            Index::open_in_dir(&index_path).map_err(|e| e.to_string())?
        } else {
            std::fs::create_dir_all(&index_path).map_err(|e| e.to_string())?;
            Index::create_in_dir(&index_path, schema.clone())
                .map_err(|e| e.to_string())?
        };

        let writer = index
            .writer(50_000_000)
            .map_err(|e| e.to_string())?;
        let reader = index
            .reader_builder()
            .reload_policy(ReloadPolicy::OnCommitWithDelay)
            .try_into()
            .map_err(|e| e.to_string())?;

        Ok(SearchState {
            index,
            reader,
            _writer: writer,
        })
    }

    pub fn index_file(&self, file_path: &str, content: &str) -> Result<(), String> {
        let schema = self.index.schema();
        let title_field = schema.get_field("title").unwrap();
        let body_field = schema.get_field("body").unwrap();
        let path_field = schema.get_field("path").unwrap();

        self._writer
            .lock()
            .map_err(|e| e.to_string())?
            .delete_term(tantivy::Term::from_field_text(
                path_field,
                file_path,
            ));

        let _ = self._writer.lock().map_err(|e| e.to_string())?.commit();

        let title = Path::new(file_path)
            .file_stem()
            .map(|s| s.to_string_lossy().to_string())
            .unwrap_or_default();

        self._writer.lock().map_err(|e| e.to_string())?.add_document(
            doc!(
                title_field => title,
                body_field => content,
                path_field => file_path,
            ),
        ).map_err(|e| e.to_string())?;

        self._writer.lock().map_err(|e| e.to_string())?.commit().map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn search(&self, query_str: &str) -> Result<Vec<SearchResult>, String> {
        let schema = self.index.schema();
        let body_field = schema.get_field("body").unwrap();
        let path_field = schema.get_field("path").unwrap();

        let searcher = self.reader.searcher();
        let query_parser = QueryParser::for_index(&self.index, vec![body_field]);
        let query = query_parser
            .parse_query(query_str)
            .map_err(|e| e.to_string())?;

        let top_docs = searcher
            .search(&query, &TopDocs::with_limit(20))
            .map_err(|e| e.to_string())?;

        let mut results = Vec::new();
        for (_score, doc_address) in top_docs {
            let doc = searcher.doc::<tantivy::TantivyDocument>(doc_address).map_err(|e| e.to_string())?;
            let file_path = doc
                .get_first(path_field)
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();

            let body = doc
                .get_first(body_field)
                .and_then(|v| v.as_str())
                .unwrap_or("");

            // Find query snippet in body
            let snippet = body
                .to_lowercase()
                .find(&query_str.to_lowercase())
                .map(|pos| {
                    let start = pos.saturating_sub(40);
                    let end = (pos + query_str.len() + 40).min(body.len());
                    let snip = &body[start..end];
                    let prefix = if start > 0 { "..." } else { "" };
                    let suffix = if end < body.len() { "..." } else { "" };
                    format!("{}{}{}", prefix, snip, suffix)
                })
                .unwrap_or_else(|| body.chars().take(80).collect());

            results.push(SearchResult {
                file_path,
                snippet,
                line_number: 1,
            });
        }
        Ok(results)
    }
}

pub struct SearchManager {
    states: Mutex<HashMap<String, SearchState>>,
}

impl SearchManager {
    pub fn new() -> Self {
        SearchManager {
            states: Mutex::new(HashMap::new()),
        }
    }

    pub fn get_or_create(&self, dir: &str) -> Result<(), String> {
        let mut states = self.states.lock().map_err(|e| e.to_string())?;
        if !states.contains_key(dir) {
            let state = SearchState::open_or_create(Path::new(dir))?;
            states.insert(dir.to_string(), state);
        }
        Ok(())
    }

    pub fn index_file(&self, dir: &str, file_path: &str, content: &str) -> Result<(), String> {
        let states = self.states.lock().map_err(|e| e.to_string())?;
        if let Some(state) = states.get(dir) {
            state.index_file(file_path, content)?;
        }
        Ok(())
    }

    pub fn search(&self, dir: &str, query: &str) -> Result<Vec<SearchResult>, String> {
        let states = self.states.lock().map_err(|e| e.to_string())?;
        if let Some(state) = states.get(dir) {
            state.search(query)
        } else {
            Ok(Vec::new())
        }
    }
}
```

- [ ] **Step 2: Wire search into commands**

Modify `src-tauri/src/commands.rs` to add the search endpoint. Add to the top:

```rust
use crate::search::SearchManager;
use std::sync::OnceLock;
```

Add a global search manager:

```rust
static SEARCH_MANAGER: OnceLock<SearchManager> = OnceLock::new();

fn get_search() -> &'static SearchManager {
    SEARCH_MANAGER.get_or_init(SearchManager::new)
}
```

Replace the placeholder `search_files` command:

```rust
#[command]
pub fn search_files(dir: String, query: String) -> Result<Vec<SearchResult>, String> {
    get_search().search(&dir, &query)
}
```

Also add a command to index a file (called after save):

```rust
#[command]
pub fn index_file(dir: String, file_path: String, content: String) -> Result<(), String> {
    get_search().get_or_create(&dir)?;
    get_search().index_file(&dir, &file_path, &content)
}
```

- [ ] **Step 3: Register new commands in lib.rs**

Update `src-tauri/src/lib.rs`:

```rust
mod commands;
mod search;
```

And add `commands::index_file` to the `invoke_handler`.

- [ ] **Step 4: Verify compilation**

```bash
cd src-tauri && cargo check 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/search.rs src-tauri/src/commands.rs src-tauri/src/lib.rs
git commit -m "feat: implement tantivy full-text search backend

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 25: Tauri Native File Dialogs

**Files:**
- Modify: `src-tauri/Cargo.toml`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add Tauri dialog plugin**

Add to `src-tauri/Cargo.toml`:

```toml
tauri-plugin-dialog = "2"
```

Run:
```bash
cd /Users/swamer/Documents/ownspace/code/bottle
npm install @tauri-apps/plugin-dialog
```

- [ ] **Step 2: Register plugin in lib.rs**

In `src-tauri/src/lib.rs`, add the plugin:

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_dialog::init())  // add this line
    .invoke_handler(...)
    ...
```

- [ ] **Step 3: Update App.tsx to use native dialogs**

Replace prompt-based file/folder openers in `src/App.tsx`:

```typescript
import { open, save } from "@tauri-apps/plugin-dialog";
```

Replace `handleOpenFolder`:
```typescript
const handleOpenFolder = async () => {
  const dir = await open({ directory: true, multiple: false });
  if (!dir) return;
  const path = typeof dir === "string" ? dir : dir;
  setWorkspace(path);
  try {
    const tree = await api.listDir(path);
    setFileTree(tree);
    // Initialize search index
    await api.searchFiles(path, "");
  } catch (e) {
    console.error("Failed to open folder:", e);
  }
};
```

Replace `handleOpenFile`:
```typescript
const handleOpenFile = async () => {
  const path = await open({
    filters: [{ name: "Markdown", extensions: ["md"] }],
    multiple: false,
  });
  if (!path) return;
  const p = typeof path === "string" ? path : path;
  try {
    const content = await api.openFile(p);
    useEditorStore.getState().setCurrentDoc(content, p);
    useFileStore.getState().addRecent(p);
  } catch (e) {
    console.error("Failed to open file:", e);
  }
};
```

- [ ] **Step 4: Verify build**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
git add src-tauri/Cargo.toml src-tauri/src/lib.rs src/App.tsx package.json package-lock.json
git commit -m "feat: add Tauri native file dialogs for open file/folder

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 26: Add Tauri Window Menu and Export Actions

**Files:**
- Modify: `src-tauri/src/lib.rs`
- Create: `src-tauri/capabilities/default.json`

- [ ] **Step 1: Configure Tauri window with menu-like actions**

Tauri v2 uses capabilities. Create or update `src-tauri/capabilities/default.json`:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "default capability",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:default",
    "dialog:default"
  ]
}
```

- [ ] **Step 2: Add export handling to App.tsx**

Add export functions to `src/App.tsx`:

```typescript
const handleExportHtml = async () => {
  const { currentDoc } = useEditorStore.getState();
  const dest = await save({
    filters: [{ name: "HTML", extensions: ["html"] }],
  });
  if (!dest) return;
  await api.exportHtml(currentDoc, dest as string);
};

const handleExportPdf = async () => {
  const { currentDoc } = useEditorStore.getState();
  const dest = await save({
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });
  if (!dest) return;
  await api.exportPdf(currentDoc, dest as string);
};
```

Add export buttons to the Toolbar or a file menu.

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src-tauri/capabilities/ src-tauri/src/lib.rs src/App.tsx
git commit -m "feat: add Tauri capabilities, export HTML/PDF actions

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 27: Final Integration — Wire Everything and Test Full Flow

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Editor.tsx`

- [ ] **Step 1: Add save-on-blur and dirty-state watcher**

In `src/App.tsx`, add a beforeunload handler to warn about unsaved changes:

```typescript
useEffect(() => {
  const handler = (e: BeforeUnloadEvent) => {
    if (useEditorStore.getState().isDirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  };
  window.addEventListener("beforeunload", handler);
  return () => window.removeEventListener("beforeunload", handler);
}, []);
```

- [ ] **Step 2: Add Ctrl+S save with dialog fallback**

Update keyboard handler in `src/App.tsx`:

```typescript
const onKey = (e: KeyboardEvent) => {
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key === "s") {
    e.preventDefault();
    saveCurrentFile();
  }
  if (mod && e.key === "o" && !e.shiftKey) {
    e.preventDefault();
    handleOpenFile();
  }
  if (mod && e.key === ",") {
    e.preventDefault();
    useUiStore.getState().setActiveModal("settings");
  }
  if (mod && e.shiftKey && e.key === "F") {
    e.preventDefault();
    useUiStore.getState().setActiveModal("search");
  }
};
```

Where `saveCurrentFile`:
```typescript
const saveCurrentFile = async () => {
  const { currentDoc, currentFilePath, markClean } = useEditorStore.getState();
  if (!currentFilePath) {
    const dest = await save({
      filters: [{ name: "Markdown", extensions: ["md"] }],
    });
    if (!dest) return;
    useEditorStore.getState().setCurrentDoc(currentDoc, dest as string);
  }
  const fp = useEditorStore.getState().currentFilePath!;
  const md = useEditorStore.getState().currentDoc;
  await api.saveFile(fp, md);
  markClean();
};
```

- [ ] **Step 3: Run full test suite**

```bash
npx vitest run 2>&1 | tail -20
cd src-tauri && cargo test 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 4: Manual test checklist**

Build and run the app:
```bash
npm run tauri dev
```

Verify:
- Open folder → file tree populates
- Click .md file → editor loads content
- Switch between Source / Split / WYSIWYG modes
- Ctrl+S saves file
- Theme toggle works (light/dark)
- Outline modal shows headings
- Search modal searches current file
- Settings modal changes theme and default mode

- [ ] **Step 5: Final commit**

```bash
git add src/App.tsx src/components/Editor.tsx
git commit -m "feat: wire full integration - save, shortcuts, unsaved warning

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```
