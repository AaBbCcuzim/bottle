import { useEditorStore } from "../stores/editorStore";
import { useUiStore } from "../stores/uiStore";
import type { EditMode } from "../types";

const modes: { mode: EditMode; label: string }[] = [
  { mode: "source", label: "Source" },
  { mode: "split", label: "Split" },
  { mode: "wysiwyg", label: "WYSIWYG" },
];

export function Toolbar() {
  const editMode = useEditorStore((s) => s.editMode);
  const setEditMode = useEditorStore((s) => s.setEditMode);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const setActiveModal = useUiStore((s) => s.setActiveModal);

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-muted/30">
      <div className="flex rounded-md border border-border overflow-hidden">
        {modes.map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setEditMode(mode)}
            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
              editMode === mode
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <button
        title="Toggle theme"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-1.5 rounded hover:bg-muted text-sm"
      >
        {theme === "dark" ? "☀" : "☾"}
      </button>

      <button
        title="Outline"
        onClick={() => setActiveModal("outline")}
        className="p-1.5 rounded hover:bg-muted text-sm"
      >
        ☰
      </button>

      <button
        title="Search"
        onClick={() => setActiveModal("search")}
        className="p-1.5 rounded hover:bg-muted text-sm"
      >
        ⌕
      </button>
    </div>
  );
}
