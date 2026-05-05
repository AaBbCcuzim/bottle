import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import { WelcomePage } from "../components/WelcomePage";
import { open } from "@tauri-apps/plugin-dialog";
import { useEditorStore } from "../stores/editorStore";
import { useFileStore } from "../stores/fileStore";
import { useConfigStore } from "../stores/configStore";
import { api } from "../api";
import { useNavigate } from "@tanstack/react-router";

function HomePage() {
  const navigate = useNavigate();

  const handleOpenFile = async () => {
    const path = await open({
      filters: [{ name: "Markdown", extensions: ["md"] }],
      multiple: false,
    });
    if (!path) return;
    const p = typeof path === "string" ? path : path;
    const content = await api.openFile(p);
    useEditorStore.getState().setCurrentDoc(content, p);
    useFileStore.getState().addRecent(p);
    navigate({ to: "/editor" });
  };

  const handleOpenFolder = async () => {
    const dir = await open({ directory: true, multiple: false });
    if (!dir) return;
    const path = typeof dir === "string" ? dir : dir;
    useFileStore.getState().setWorkspace(path);
    const tree = await api.listDir(path, useConfigStore.getState().fileExtensions);
    useFileStore.getState().setFileTree(tree);
    navigate({ to: "/editor" });
  };

  return <WelcomePage onOpenFile={handleOpenFile} onOpenFolder={handleOpenFolder} />;
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
