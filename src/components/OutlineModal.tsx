import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
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

  return (
    <Dialog open={activeModal === "outline"} onOpenChange={(open) => { if (!open) setActiveModal(null); }}>
      <DialogContent className="w-80">
        <DialogTitle>Outline</DialogTitle>
        {headings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No headings found</p>
        ) : (
          <ScrollArea className="max-h-80">
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
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
