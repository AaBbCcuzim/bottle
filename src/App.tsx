import { ThemeProvider } from "./components/ThemeProvider";
import { Toolbar } from "./components/Toolbar";
import { StatusBar } from "./components/StatusBar";
import { Sidebar } from "./components/Sidebar";
import { useFileStore } from "./stores/fileStore";
import { useEditorStore } from "./stores/editorStore";
import { api } from "./api";
import { useEffect } from "react";

function App() {
  const setWorkspace = useFileStore((s) => s.setWorkspace);
  const setFileTree = useFileStore((s) => s.setFileTree);
  const currentDoc = useEditorStore((s) => s.currentDoc);

  const handleOpenFolder = async () => {
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

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "s") {
        e.preventDefault();
        const { currentDoc, currentFilePath, markClean } = useEditorStore.getState();
        if (currentFilePath) {
          api.saveFile(currentFilePath, currentDoc).then(() => markClean());
        }
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
