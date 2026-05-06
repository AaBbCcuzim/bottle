import { createRoute, useRouter } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { useUiStore } from "../stores/uiStore";
import { useEditorStore } from "../stores/editorStore";
import { useFileStore } from "../stores/fileStore";
import { useConfigStore } from "../stores/configStore";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from "../components/ui/item";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "../components/ui/sidebar";
import { Palette, PenLine, FileText, Keyboard, Wrench } from "lucide-react";
import type { ThemeMode, EditMode } from "../types";

type Category = "appearance" | "editor" | "files" | "shortcuts" | "tools";

const BUILTIN_THEMES = [
  { id: "github", name: "GitHub" },
  { id: "nord", name: "Nord" },
  { id: "claude", name: "Claude" },
];

function AppearancePanel() {
  const { t } = useTranslation();
  const themeMode = useConfigStore((s) => s.themeMode);
  const setThemeMode = useConfigStore((s) => s.setThemeMode);
  const activeThemeId = useConfigStore((s) => s.activeThemeId);
  const setActiveTheme = useConfigStore((s) => s.setActiveTheme);

  const [customThemes, setCustomThemes] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("bottle-themes") || "{}");
    const themes = Object.entries(stored).map(([id, t]) => ({ id, name: (t as { name: string }).name }));
    setCustomThemes(themes);
  }, []);

  const allThemes = [...BUILTIN_THEMES, ...customThemes];
  const activeThemeName = allThemes.find((t) => t.id === activeThemeId)?.name || "GitHub";

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".css";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const id = `custom-${Date.now()}`;
      const name = file.name.replace(/\.css$/, "");
      const text = await file.text();
      const stored = JSON.parse(localStorage.getItem("bottle-themes") || "{}");
      stored[id] = { name, css: text };
      localStorage.setItem("bottle-themes", JSON.stringify(stored));
      setCustomThemes((prev) => [...prev, { id, name }]);
      setActiveTheme(id);
    };
    input.click();
  };

  const modes: { mode: ThemeMode; label: string }[] = [
    { mode: "light", label: t("light") },
    { mode: "dark", label: t("dark") },
    { mode: "system", label: t("system") },
  ];

  const lang = i18n.language || "en";
  const langLabels: Record<string, string> = {
    "zh-CN": "中文", en: "English", ja: "日本語",
    ko: "한국어", fr: "Français", de: "Deutsch",
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">{t("theme")}</h3>
      <Card size="sm">
        <CardContent className="flex flex-col gap-4">
        <Item size="sm">
          <ItemContent>
            <ItemTitle>{t("themeMode")}</ItemTitle>
            <ItemDescription>{t("themeModeDesc")}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <div className="flex rounded-md border border-border overflow-hidden">
              {modes.map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => setThemeMode(mode as ThemeMode)}
                  className={`px-4 py-1.5 text-sm transition-colors ${
                    themeMode === mode
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </ItemActions>
        </Item>

        <Item size="sm">
          <ItemContent>
            <ItemTitle>{t("themeStyle")}</ItemTitle>
            <ItemDescription>{t("themeStyleDesc")}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Select value={activeThemeId} onValueChange={(id) => { if (id) setActiveTheme(id); }}>
              <SelectTrigger className="w-40">
                <span className="flex flex-1 text-left">{activeThemeName}</span>
              </SelectTrigger>
              <SelectContent>
                  {allThemes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </ItemActions>
        </Item>

        <Item size="sm">
          <ItemContent>
            <ItemTitle>{t("importTheme")}</ItemTitle>
            <ItemDescription>{t("importThemeDesc")}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button  size="sm" onClick={handleImport}>{t("import")}</Button>
          </ItemActions>
        </Item>
      </CardContent>
    </Card>

    <h3 className="text-sm font-medium">{t("language")}</h3>
    <Card size="sm">
      <CardContent>
        <Item size="sm">
          <ItemContent>
            <ItemTitle>{t("language")}</ItemTitle>
            <ItemDescription>{t("languageDesc")}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Select
            value={lang}
            onValueChange={(lng) => {
              if (!lng) return;
              i18n.changeLanguage(lng);
              localStorage.setItem("i18nextLng", lng);
            }}
          >
            <SelectTrigger className="w-40">
              <span className="flex flex-1 text-left">{langLabels[lang] || lang}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zh-CN">中文</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="ko">한국어</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </ItemActions>
      </Item>
      </CardContent>
    </Card>
    </div>
  );
}

function EditorPanel() {
  const { t } = useTranslation();
  const editMode = useEditorStore((s) => s.editMode);
  const setEditMode = useEditorStore((s) => s.setEditMode);

  const editModes: { mode: EditMode; label: string }[] = [
    { mode: "wysiwyg", label: t("wysiwyg") },
    { mode: "split", label: t("split") },
    { mode: "source", label: t("source") },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">{t("editor")}</h3>
      <Card size="sm">
        <CardContent>
          <Item size="sm">
            <ItemContent>
              <ItemTitle>{t("editMode")}</ItemTitle>
              <ItemDescription>{t("editModeDesc")}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <div className="flex rounded-md border border-border overflow-hidden">
                {editModes.map(({ mode, label }) => (
                  <button
                    key={mode}
                    onClick={() => setEditMode(mode)}
                    className={`px-4 py-1.5 text-sm transition-colors ${
                      editMode === mode
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </ItemActions>
          </Item>
        </CardContent>
      </Card>
    </div>
  );
}

function FilesPanel() {
  const { t } = useTranslation();
  const fileExtensions = useConfigStore((s) => s.fileExtensions);
  const setFileExtensions = useConfigStore((s) => s.setFileExtensions);
  const [inputValue, setInputValue] = useState(fileExtensions.join(", "));

  const handleSave = () => {
    const exts = inputValue
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setFileExtensions(exts);
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">{t("files")}</h3>
      <Card size="sm">
        <CardContent>
          <Item size="sm">
            <ItemContent>
              <ItemTitle>{t("fileExtensions")}</ItemTitle>
              <ItemDescription>{t("fileExtensionsHint")}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                  placeholder="md, txt"
                  className="w-32"
                />
                <Button onClick={handleSave} size="sm">{t("apply")}</Button>
              </div>
            </ItemActions>
          </Item>
        </CardContent>
      </Card>
    </div>
  );
}

function ToolsPanel() {
  const { t } = useTranslation();
  const router = useRouter();
  const setActiveModal = useUiStore((s) => s.setActiveModal);

  const openTool = (modal: "outline" | "search") => {
    router.navigate({ to: "/editor" });
    setActiveModal(modal);
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">{t("tools")}</h3>
      <Card size="sm">
        <CardContent>
          <Item size="sm">
            <ItemContent>
              <ItemTitle>{t("quickActions")}</ItemTitle>
              <ItemDescription>{t("quickActionsDesc")}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <div className="flex gap-3">
                <Button  onClick={() => openTool("outline")}>{t("outline")}</Button>
                <Button  onClick={() => openTool("search")}>{t("search")}</Button>
              </div>
            </ItemActions>
          </Item>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardContent className="flex flex-col gap-4">
          <Item size="sm">
            <ItemContent>
              <ItemTitle>{t("export")}</ItemTitle>
              <ItemDescription>{t("configExportDesc")}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button  size="sm" onClick={async () => {
                const { api } = await import("../api");
                const config = await api.getConfig();
                const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "bottle-config.json";
                a.click();
                URL.revokeObjectURL(a.href);
              }}>{t("export")}</Button>
            </ItemActions>
          </Item>
          <Item size="sm">
            <ItemContent>
              <ItemTitle>{t("import")}</ItemTitle>
              <ItemDescription>{t("configImportDesc")}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button  size="sm" onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".json";
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  try {
                    const config = JSON.parse(await file.text());
                    if (!config.file_extensions) throw new Error("invalid");
                    const { api } = await import("../api");
                    await api.setConfig(config);
                    window.location.reload();
                  } catch { alert("Invalid config file"); }
                };
                input.click();
              }}>{t("import")}</Button>
            </ItemActions>
          </Item>
        </CardContent>
      </Card>
    </div>
  );
}

function ShortcutsPanel() {
  const { t } = useTranslation();

  const shortcuts = [
    { keys: "⌘/Ctrl + S", action: t("shortcutSave") },
    { keys: "⌘/Ctrl + O", action: t("shortcutOpen") },
    { keys: "⌘/Ctrl + ,", action: t("shortcutSettings") },
    { keys: "⌘/Ctrl + Shift + F", action: t("shortcutSearch") },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">{t("shortcuts")}</h3>
      <Card size="sm" className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">{t("action")}</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">{t("shortcutKey")}</th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.map((s) => (
              <tr key={s.action} className="border-t border-border">
                <td className="px-4 py-2">{s.action}</td>
                <td className="px-4 py-2">
                  <kbd className="px-2 py-0.5 text-xs rounded bg-muted border border-border font-mono">
                    {s.keys}
                  </kbd>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

const panelMap: Record<Category, () => React.ReactNode> = {
  appearance: AppearancePanel,
  editor: EditorPanel,
  files: FilesPanel,
  shortcuts: ShortcutsPanel,
  tools: ToolsPanel,
};

function SettingsPage() {
  const { t } = useTranslation();
  const [active, setActive] = useState<Category>("appearance");
  const router = useRouter();
  const workspaceDir = useFileStore((s) => s.workspaceDir);

  const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
    { id: "appearance", label: t("appearance"), icon: <Palette /> },
    { id: "editor", label: t("editor"), icon: <PenLine /> },
    { id: "files", label: t("files"), icon: <FileText /> },
    { id: "shortcuts", label: t("shortcuts"), icon: <Keyboard /> },
    { id: "tools", label: t("tools"), icon: <Wrench /> },
  ];

  const currentFilePath = useEditorStore((s) => s.currentFilePath);
  const handleBack = () => {
    router.navigate({ to: workspaceDir || currentFilePath ? "/editor" : "/" });
  };

  const Panel = panelMap[active];

  return (
    <SidebarProvider className="flex-1 min-h-0">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar collapsible="none" className="w-64 border-r border-border">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleBack}>
                  {t("back")}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{t("settingsTitle")}</SidebarGroupLabel>
              <SidebarMenu>
                {categories.map(({ id, label, icon }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      isActive={active === id}
                      onClick={() => setActive(id)}
                    >
                      {icon}
                      {label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center px-6 pt-4 pb-3">
            <h2 className="text-base font-semibold">
              {categories.find((c) => c.id === active)?.label}
            </h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-6">
              <Panel />
            </div>
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
}

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});
