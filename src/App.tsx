import { ThemeProvider } from "./components/ThemeProvider";
import { Toolbar } from "./components/Toolbar";
import { StatusBar } from "./components/StatusBar";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { OutlineModal } from "./components/OutlineModal";
import { SearchModal } from "./components/SearchModal";
import { SettingsModal } from "./components/SettingsModal";
import { useFileStore } from "./stores/fileStore";
import { useEditorStore } from "./stores/editorStore";
import { useUiStore } from "./stores/uiStore";
import { open, save } from "@tauri-apps/plugin-dialog";
import { api } from "./api";
import { useEffect } from "react";

function App() {
  const setWorkspace = useFileStore((s) => s.setWorkspace);
  const setFileTree = useFileStore((s) => s.setFileTree);
  const currentDoc = useEditorStore((s) => s.currentDoc);

  const handleOpenFolder = async () => {
    const dir = await open({ directory: true, multiple: false });
    if (!dir) return;
    const path = typeof dir === "string" ? dir : dir;
    setWorkspace(path);
    try {
      const tree = await api.listDir(path);
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
        useUiStore.getState().setActiveModal("settings");
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
        <Toolbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
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
      <SettingsModal />
    </ThemeProvider>
  );
}

export default App;
