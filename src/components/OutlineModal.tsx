import { useMemo } from "react";
import { useUiStore } from "../stores/uiStore";
import { useEditorStore } from "../stores/editorStore";

interface TocItem {
  level: number;
  text: string;
  line: number;
}

function extractHeadings(md: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: i,
      });
    }
  }
  return headings;
}

export function OutlineModal() {
  const activeModal = useUiStore((s) => s.activeModal);
  const setActiveModal = useUiStore((s) => s.setActiveModal);
  const currentDoc = useEditorStore((s) => s.currentDoc);

  const headings = useMemo(() => extractHeadings(currentDoc), [currentDoc]);

  if (activeModal !== "outline") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div
        className="fixed inset-0 bg-black/20"
        onClick={() => setActiveModal(null)}
      />
      <div className="relative z-10 w-80 max-h-96 overflow-y-auto rounded-lg border border-border bg-background shadow-lg p-4">
        <h2 className="text-sm font-semibold mb-3">Outline</h2>
        {headings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No headings found</p>
        ) : (
          <ul className="space-y-0.5">
            {headings.map((h, i) => (
              <li
                key={i}
                onClick={() => setActiveModal(null)}
                className="text-sm hover:bg-muted rounded px-2 py-0.5 cursor-pointer truncate"
                style={{ paddingLeft: `${8 + (h.level - 1) * 12}px` }}
              >
                {h.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
