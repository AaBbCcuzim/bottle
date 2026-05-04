import { ThemeProvider } from "./components/ThemeProvider";
import { Toolbar } from "./components/Toolbar";
import { StatusBar } from "./components/StatusBar";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { OutlineModal } from "./components/OutlineModal";
import { SearchModal } from "./components/SearchModal";
import { SettingsPage } from "./components/SettingsPage";
import { Titlebar } from "./components/Titlebar";
import { useFileStore } from "./stores/fileStore";
import { useConfigStore } from "./stores/configStore";
import { useEditorStore } from "./stores/editorStore";
import { useUiStore } from "./stores/uiStore";
import { confirm } from "@tauri-apps/plugin-dialog";
import { open, save } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { Menu, MenuItem, PredefinedMenuItem } from "@tauri-apps/api/menu";
import { api } from "./api";
import { useEffect } from "react";

function App() {
  const setWorkspace = useFileStore((s) => s.setWorkspace);
  const setFileTree = useFileStore((s) => s.setFileTree);
  const currentDoc = useEditorStore((s) => s.currentDoc);
  const setPage = useUiStore((s) => s.setPage);
  const setPlatform = useUiStore((s) => s.setPlatform);
  const loadConfig = useConfigStore((s) => s.loadConfig);
  const fileExtensions = useConfigStore((s) => s.fileExtensions);

  // Initialize platform on mount
  useEffect(() => {
    invoke<string>("get_platform").then((p) => {
      setPlatform(p as "macos" | "windows" | "linux" | "unknown");
    });
  }, []);

  // Load persisted config on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Refresh file tree when extensions change and workspace is open
  const workspaceDir = useFileStore((s) => s.workspaceDir);
  useEffect(() => {
    if (!workspaceDir) return;
    api.listDir(workspaceDir, fileExtensions).then(setFileTree).catch(console.error);
  }, [fileExtensions, workspaceDir, setFileTree]);

  // macOS native menu: add Settings... to app menu
  useEffect(() => {
    const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    if (!isTauri) return;

    const setupMenu = async () => {
      const menu = await Menu.default();
      const items = await menu.items();
      const appMenu = items[0];
      if (!appMenu || !("append" in appMenu)) return;

      await appMenu.append(
        await PredefinedMenuItem.new({ item: "Separator" }),
      );
      await appMenu.append(
        await MenuItem.new({
          text: "Settings...",
          accelerator: "Cmd+,",
          action: () => useUiStore.getState().setPage("settings"),
        }),
      );
      await menu.setAsAppMenu();
    };

    setupMenu();
  }, []);

  // Close handler with dirty document check
  useEffect(() => {
    const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    if (!isTauri) return;

    const unlisten = getCurrentWindow().onCloseRequested(async (event) => {
      if (useEditorStore.getState().isDirty) {
        const shouldClose = await confirm(
          "You have unsaved changes. Close anyway?",
          { title: "Unsaved Changes", kind: "warning" }
        );
        if (!shouldClose) {
          event.preventDefault();
        }
      }
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleOpenFolder = async () => {
    const dir = await open({ directory: true, multiple: false });
    if (!dir) return;
    const path = typeof dir === "string" ? dir : dir;
    setWorkspace(path);
    try {
      const tree = await api.listDir(path, fileExtensions);
      setFileTree(tree);
    } catch (e) {
      console.error("Failed to open folder:", e);
    }
  };

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

  const saveCurrentFile = async () => {
    const { currentDoc, currentFilePath, markClean } =
      useEditorStore.getState();
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

  const handleExportHtml = async () => {
    const { currentDoc } = useEditorStore.getState();
    const dest = await save({
      filters: [{ name: "HTML", extensions: ["html"] }],
    });
    if (!dest) return;
    await api.exportHtml(currentDoc, dest as string);
  };
  void handleExportHtml;

  // Keyboard shortcuts
  useEffect(() => {
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
        setPage("settings");
      }
      if (mod && e.shiftKey && e.key === "F") {
        e.preventDefault();
        useUiStore.getState().setActiveModal("search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    if (isTauri) return;

    const handler = (e: BeforeUnloadEvent) => {
      if (useEditorStore.getState().isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <Titlebar />
        <Toolbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col items-center justify-center text-muted-foreground overflow-hidden">
            {currentDoc ? (
              <Editor />
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
      <OutlineModal />
      <SearchModal />
      <SettingsPage />
    </ThemeProvider>
  );
}

export default App;
