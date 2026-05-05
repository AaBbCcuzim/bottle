import { useEditorStore } from "../stores/editorStore";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export function StatusBar() {
  const { t } = useTranslation();
  const currentDoc = useEditorStore((s) => s.currentDoc);
  const currentFilePath = useEditorStore((s) => s.currentFilePath);
  const editMode = useEditorStore((s) => s.editMode);

  const stats = useMemo(() => {
    const lines = currentDoc ? currentDoc.split("\n").length : 0;
    const words = currentDoc
      ? currentDoc.trim().split(/\s+/).filter(Boolean).length
      : 0;
    return { lines, words };
  }, [currentDoc]);

  return (
    <div className="flex items-center gap-4 px-3 py-1 border-t border-border bg-muted/30 text-xs text-muted-foreground">
      <span>{t("words")}: {stats.words}</span>
      <span>{t("lines")}: {stats.lines}</span>
      <span className="uppercase">{editMode}</span>
      <span className="flex-1 text-right truncate">
        {currentFilePath || t("noFileOpen")}
      </span>
    </div>
  );
}
