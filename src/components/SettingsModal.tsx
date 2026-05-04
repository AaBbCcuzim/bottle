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
      <div className="fixed inset-0 bg-black/20" onClick={() => setActiveModal(null)} />
      <div className="relative z-10 w-80 rounded-lg border border-border bg-background shadow-lg p-6 space-y-5">
        <h2 className="text-sm font-semibold">Settings</h2>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">Theme</label>
          <div className="flex rounded-md border border-border overflow-hidden">
            {themes.map(({ mode, label }) => (
              <button key={mode} onClick={() => setTheme(mode)}
                className={`flex-1 py-1.5 text-xs ${theme === mode ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">Default Edit Mode</label>
          <div className="flex rounded-md border border-border overflow-hidden">
            {modes.map(({ mode, label }) => (
              <button key={mode} onClick={() => setEditMode(mode)}
                className={`flex-1 py-1.5 text-xs ${editMode === mode ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
