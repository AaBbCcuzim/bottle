import { createRootRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import i18n from "../i18n";
import { TooltipProvider } from "../components/ui/tooltip";
import { ThemeProvider } from "../components/ThemeProvider";
import { Titlebar } from "../components/Titlebar";
import { Toolbar } from "../components/Toolbar";
import { StatusBar } from "../components/StatusBar";
import { OutlineModal } from "../components/OutlineModal";
import { SearchModal } from "../components/SearchModal";
import { useUiStore } from "../stores/uiStore";
import { useConfigStore } from "../stores/configStore";
import { useEditorStore } from "../stores/editorStore";
import { useFileStore } from "../stores/fileStore";
import { invoke } from "@tauri-apps/api/core";
import { confirm, open, save } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Menu, Submenu, MenuItem, PredefinedMenuItem } from "@tauri-apps/api/menu";
import { api } from "../api";

function RootLayout() {
  const setPlatform = useUiStore((s) => s.setPlatform);
  const loadConfig = useConfigStore((s) => s.loadConfig);
  const router = useRouter();

  useEffect(() => {
    invoke<string>("get_platform").then((p) => {
      setPlatform(p as "macos" | "windows" | "linux" | "unknown");
    });
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Menu
  useEffect(() => {
    const win = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    if (!win) return;

    const openFile = async () => {
      const path = await open({
        filters: [{ name: "Markdown", extensions: ["md"] }],
        multiple: false,
      });
      if (!path) return;
      const p = typeof path === "string" ? path : path;
      const content = await api.openFile(p);
      useEditorStore.getState().setCurrentDoc(content, p);
      useFileStore.getState().addRecent(p);
      router.navigate({ to: "/editor" });
    };

    const openFolder = async () => {
      const dir = await open({ directory: true, multiple: false });
      if (!dir) return;
      const path = typeof dir === "string" ? dir : dir;
      useFileStore.getState().setWorkspace(path);
      const tree = await api.listDir(path, useConfigStore.getState().fileExtensions);
      useFileStore.getState().setFileTree(tree);
      router.navigate({ to: "/editor" });
    };

    const setupMenu = async () => {
      const appSub = await Submenu.new({
        text: i18n.t("menu_app"),
        items: [
          await PredefinedMenuItem.new({ item: "Separator" }),
          await PredefinedMenuItem.new({ item: "Services" }),
          await PredefinedMenuItem.new({ item: "Separator" }),
          await PredefinedMenuItem.new({ item: "Hide" }),
          await PredefinedMenuItem.new({ item: "HideOthers" }),
          await PredefinedMenuItem.new({ item: "ShowAll" }),
          await PredefinedMenuItem.new({ item: "Separator" }),
          await MenuItem.new({
            text: i18n.t("menu_settings"),
            accelerator: "Cmd+,",
            action: () => router.navigate({ to: "/settings" }),
          }),
          await PredefinedMenuItem.new({ item: "Separator" }),
          await PredefinedMenuItem.new({ item: "Quit" }),
        ],
      });

      const fileSub = await Submenu.new({
        text: i18n.t("menu_file"),
        items: [
          await MenuItem.new({
            text: i18n.t("menu_openFile"),
            accelerator: "Cmd+O",
            action: openFile,
          }),
          await MenuItem.new({
            text: i18n.t("menu_openFolder"),
            action: openFolder,
          }),
        ],
      });

      const editSub = await Submenu.new({
        text: i18n.t("menu_edit"),
        items: [
          await PredefinedMenuItem.new({ item: "Undo" }),
          await PredefinedMenuItem.new({ item: "Redo" }),
          await PredefinedMenuItem.new({ item: "Separator" }),
          await PredefinedMenuItem.new({ item: "Cut" }),
          await PredefinedMenuItem.new({ item: "Copy" }),
          await PredefinedMenuItem.new({ item: "Paste" }),
          await PredefinedMenuItem.new({ item: "SelectAll" }),
        ],
      });

      const viewSub = await Submenu.new({
        text: i18n.t("menu_view"),
        items: [
          await PredefinedMenuItem.new({ item: "Fullscreen" }),
        ],
      });

      const windowSub = await Submenu.new({
        text: i18n.t("menu_window"),
        items: [
          await PredefinedMenuItem.new({ item: "Minimize" }),
          await PredefinedMenuItem.new({ item: "Separator" }),
          await PredefinedMenuItem.new({ item: "CloseWindow" }),
        ],
      });

      const menu = await Menu.new({
        items: [appSub, fileSub, editSub, viewSub, windowSub],
      });

      await menu.setAsAppMenu();
    };

    setupMenu();
  }, []);

  // Close handler
  useEffect(() => {
    const win = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    if (!win) return;

    const unlisten = getCurrentWindow().onCloseRequested(async (event) => {
      if (useEditorStore.getState().isDirty) {
        const shouldClose = await confirm(
          i18n.t("unsavedMessage"),
          { title: i18n.t("unsavedTitle"), kind: "warning" }
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

  // Keyboard shortcuts
  useEffect(() => {
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

    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "s") {
        e.preventDefault();
        saveCurrentFile();
      }
      if (mod && e.key === "o" && !e.shiftKey) {
        e.preventDefault();
        open({
          filters: [{ name: "Markdown", extensions: ["md"] }],
          multiple: false,
        }).then(async (path) => {
          if (!path) return;
          const p = typeof path === "string" ? path : path;
          const content = await api.openFile(p);
          useEditorStore.getState().setCurrentDoc(content, p);
          useFileStore.getState().addRecent(p);
          router.navigate({ to: "/editor" });
        });
      }
      if (mod && e.key === ",") {
        e.preventDefault();
        router.navigate({ to: "/settings" });
      }
      if (mod && e.shiftKey && e.key === "F") {
        e.preventDefault();
        useUiStore.getState().setActiveModal("search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Browser beforeunload
  useEffect(() => {
    const win = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    if (win) return;

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
    <TooltipProvider>
    <ThemeProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <Titlebar />
        <Toolbar />
        <Outlet />
        <StatusBar />
      </div>
      <OutlineModal />
      <SearchModal />
    </ThemeProvider>
    </TooltipProvider>
  );
}

export const rootRoute = createRootRoute({
  component: RootLayout,
});
