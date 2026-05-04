# Markdown Desktop Editor — Design Spec

## Overview

A cross-platform Markdown desktop editor for daily note-taking and document writing. Built with Tauri + React + Milkdown, supporting three editing modes, file management, and full Markdown extensibility.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Desktop Shell | **Tauri v2** | Lightweight (~5MB), Rust backend, cross-platform |
| Frontend Framework | **React 18+** | Ecosystem maturity, shadcn/ui compatibility |
| State Management | **Zustand** | Lightweight, no boilerplate, good TypeScript support |
| UI Components | **shadcn/ui + Tailwind CSS** | Tauri community standard, minimal bundle |
| Markdown Editor | **Milkdown 7** (ProseMirror + Remark) | Native support for three edit modes, plugin-driven |
| Full-text Search | **tantivy** (Rust) | Lucene-compatible, performant local indexing |

## Editing Modes

Three modes, user-switchable via toolbar:

1. **Source Only** — full-width raw Markdown editing, no preview
2. **Split View** — left 50% source, right 50% live preview
3. **WYSIWYG** — render-as-you-type, Typora-style

## UI Layout

```
┌──────────────────────────────────────────────────────────┐
│  Menu Bar (native on macOS, embedded on Windows/Linux)   │
├──────┬───────────────────────────────────────────────────┤
│ File │  Toolbar: mode | theme | outline | search | export│
│ Tree ├───────────────────────────────────────────────────┤
│      │                                                   │
│      │            Editor / Preview Area                  │
│      │            (Milkdown core)                        │
│      │                                                   │
│      ├───────────────────────────────────────────────────┤
│      │  Status bar: word count | lines | mode | path     │
└──────┴───────────────────────────────────────────────────┘
```

- **File tree panel**: left sidebar, collapsible, supports right-click context menu (new/rename/delete)
- **Outline (TOC)**: standalone modal, triggered by shortcut/toolbar, lists heading hierarchy, click to jump
- **Search**: modal with two tabs — current file search + global workspace search
- **Settings**: modal for preferences (theme, font, default edit mode)

## File Management

Dual mode:

- **Single file**: open any `.md` file for quick viewing/editing
- **Workspace (folder)**: open a directory, show file tree, manage long-term notes

No tabs. File caching via LRU queue for recently opened files (future enhancement).

## Panels & Modals

| Panel | Form | Trigger |
|-------|------|---------|
| File Tree | Fixed left sidebar | Auto when workspace open |
| Outline (TOC) | Modal | Toolbar button / `Ctrl+O` |
| Search | Modal | Toolbar button / `Ctrl+Shift+F` |
| Settings | Modal | Menu / `Ctrl+,` |

## Theme

Three modes:
- Light
- Dark
- Follow system (auto-detect `prefers-color-scheme`)

Default: system. UI stays minimal with shadcn/ui default styling.

## Data Flow

```
Zustand Stores
  ├── fileStore:    fileTree[], activeFile, openRecent[]
  ├── editorStore:  currentDoc, editMode, isDirty, selection
  └── uiStore:      theme, sidebarOpen, activeModal

User action → Zustand action → Tauri command (Rust) or Milkdown API
                                 ↓
                            Disk / Editor
```

- Editor core is filesystem-agnostic: it receives and outputs markdown strings only
- All file I/O goes through Tauri commands invoked from Zustand actions
- Image paste: frontend intercepts clipboard → Tauri `save_image` → returns relative path → inserts Markdown

## Zustand Stores

| Store | Key State | Description |
|-------|-----------|-------------|
| `fileStore` | `fileTree`, `activeFile`, `openRecent` | File system interaction, recent files cache |
| `editorStore` | `currentDoc`, `editMode`, `isDirty`, `selection` | Editor state, mode, dirty flag |
| `uiStore` | `theme`, `sidebarOpen`, `activeModal` | UI preferences and panel visibility |

## Tauri Backend Commands

| Command | Params | Returns | Description |
|---------|--------|---------|-------------|
| `open_file` | path | content: String | Read file from disk |
| `save_file` | path, content | Result | Write file to disk |
| `list_dir` | path | FileEntry[] | List directory contents |
| `create_file` | parent_dir, name | Result | Create new .md file |
| `rename_file` | old_path, new_name | Result | Rename file |
| `delete_file` | path | Result | Move to trash |
| `save_image` | data: Vec<u8>, filename | relative_path | Save clipboard image, return relative path |
| `search_files` | dir, query | SearchResult[] | Full-text search with tantivy |
| `export_pdf` | src_path, dest_path | Result | Export markdown to PDF |
| `export_html` | src_path, dest_path | Result | Export markdown to HTML |

Full-text search uses tantivy. Index is built asynchronously when a workspace folder is opened.

## Plugin / Extension Features

All via Milkdown official or community plugins:

| Feature | Plugin | Status |
|---------|--------|--------|
| LaTeX Math | `@milkdown/plugin-math` (KaTeX) | Official |
| Mermaid Diagrams | `@milkdown/plugin-diagram` | Official |
| Code Highlighting | `@milkdown/plugin-highlight` (Shiki) | Official |
| Image Paste | `@milkdown/plugin-clipboard` + custom upload handler | Official + custom |
| Custom MD Syntax | `$remark` utility + custom remark plugins | Extensible |

Custom Markdown syntax is supported via remark plugins (AST-level transformation), wrapped with Milkdown's `$remark` utility. Equivalent in flexibility to markdown-it's custom rules.

## Testing Strategy (TDD)

| Layer | Tool | Focus |
|-------|------|-------|
| Rust backend | `cargo test` | File I/O, search indexing, export |
| React components | Vitest + React Testing Library | Component behavior, state transitions |
| E2E | Tauri + Playwright (later) | Full user flows |

Key test scenarios:
- Edit mode switching → Zustand state correctness
- File open/save/rename/delete → correct Tauri command invocation
- Image paste → file saved → correct markdown path insertion
- Theme switching → correct UI refresh
- Large document (100k+ chars) → Milkdown performance acceptable

Development follows TDD: write tests first, then implementation.

## No-Go (for now)

- Git integration
- Cloud sync / publishing
- Collaboration / real-time editing
- Tabs (LRU cache queue as future enhancement)
