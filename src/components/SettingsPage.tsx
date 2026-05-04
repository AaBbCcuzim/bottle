import React, { useState } from "react";
import { useUiStore } from "../stores/uiStore";
import { useEditorStore } from "../stores/editorStore";
import type { ThemeMode, EditMode } from "../types";

type Category = "appearance" | "editor" | "shortcuts";

const categories: { id: Category; label: string }[] = [
  { id: "appearance", label: "外观" },
  { id: "editor", label: "编辑器" },
  { id: "shortcuts", label: "快捷键" },
];

const themes: { mode: ThemeMode; label: string }[] = [
  { mode: "light", label: "浅色" },
  { mode: "dark", label: "深色" },
  { mode: "system", label: "跟随系统" },
];

const editModes: { mode: EditMode; label: string }[] = [
  { mode: "wysiwyg", label: "所见即所得" },
  { mode: "split", label: "分屏预览" },
  { mode: "source", label: "纯源码" },
];

const shortcuts = [
  { keys: "⌘/Ctrl + S", action: "保存文件" },
  { keys: "⌘/Ctrl + O", action: "打开文件" },
  { keys: "⌘/Ctrl + ,", action: "打开设置" },
  { keys: "⌘/Ctrl + Shift + F", action: "搜索" },
];

function AppearancePanel() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3">主题模式</h3>
        <div className="flex rounded-md border border-border overflow-hidden w-fit">
          {themes.map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              className={`px-4 py-1.5 text-sm transition-colors ${
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
    </div>
  );
}

function EditorPanel() {
  const editMode = useEditorStore((s) => s.editMode);
  const setEditMode = useEditorStore((s) => s.setEditMode);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3">默认编辑模式</h3>
        <div className="flex rounded-md border border-border overflow-hidden w-fit">
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
      </div>
    </div>
  );
}

function ShortcutsPanel() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">快捷键</h3>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">操作</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">快捷键</th>
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
      </div>
    </div>
  );
}

const panelMap: Record<Category, () => React.ReactNode> = {
  appearance: AppearancePanel,
  editor: EditorPanel,
  shortcuts: ShortcutsPanel,
};

export function SettingsPage() {
  const [active, setActive] = useState<Category>("appearance");
  const page = useUiStore((s) => s.page);
  const setPage = useUiStore((s) => s.setPage);

  if (page !== "settings") return null;

  const Panel = panelMap[active];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/40"
        onClick={() => setPage("editor")}
      />
      <div className="relative z-10 w-[42rem] h-[28rem] flex rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
        <nav className="w-40 border-r border-border shrink-0 py-4 bg-muted/10">
          <div className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            设置
          </div>
          {categories.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`w-full text-left px-4 py-1.5 text-sm transition-colors ${
                active === id
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">
              {categories.find((c) => c.id === active)?.label}
            </h2>
            <button
              onClick={() => setPage("editor")}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <Panel />
          </div>
        </div>
      </div>
    </div>
  );
}
