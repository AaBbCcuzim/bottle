<p align="center">
  <img src="icon.png" alt="bottle icon" width="128" />
</p>

<h1 align="center">bottle</h1>

<p align="center">A cross-platform Markdown desktop editor for daily note-taking and document writing. Built with Tauri + React + Milkdown.</p>

## Features

- **Three editing modes** — Source only, Split view (source + preview), WYSIWYG (Typora-style)
- **File management** — Open single `.md` files or workspace folders with a file tree sidebar
- **LaTeX math** — KaTeX rendering for mathematical formulas
- **Mermaid diagrams** — Flowcharts, sequence diagrams, and more
- **Syntax highlighting** — Shiki-powered code highlighting with 15+ languages
- **Full-text search** — tantivy-powered indexing across workspace files
- **Image paste** — Clipboard images saved locally with relative path references
- **Theme support** — Light, dark, and follow-system modes
- **Export** — HTML export (PDF planned)
- **Outline** — Heading-based table of contents via modal

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Tauri v2 (Rust) |
| Frontend | React 19 + TypeScript |
| Editor | Milkdown 7 (ProseMirror + Remark) |
| State | Zustand |
| UI | shadcn/ui + Tailwind CSS v4 |
| Search | tantivy |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/) 1.70+
- macOS / Windows / Linux

### Install

```bash
git clone https://github.com/AaBbCcuzim/bottle.git
cd bottle
npm install
```

### Develop

```bash
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

The packaged app will be in `src-tauri/target/release/bundle/`.

### Test

```bash
# Frontend
npx vitest run

# Rust backend
cd src-tauri && cargo test --lib
```

## Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl/Cmd + S` | Save current file |
| `Ctrl/Cmd + O` | Open file |
| `Ctrl/Cmd + ,` | Settings |
| `Ctrl/Cmd + Shift + F` | Search |

## Project Structure

```
src/                  # React frontend
  components/         # UI components (Editor, Toolbar, Sidebar, modals...)
  stores/             # Zustand stores (ui, editor, file)
  lib/                # Utilities
src-tauri/            # Tauri Rust backend
  src/
    commands.rs       # File I/O, image, export commands
    search.rs         # tantivy full-text search
    lib.rs            # Command registration
```
