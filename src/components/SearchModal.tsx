import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../components/ui/dialog";
import { useUiStore } from "../stores/uiStore";
import { useEditorStore } from "../stores/editorStore";
import { api } from "../api";
import type { SearchResult } from "../types";

export function SearchModal() {
  const { t } = useTranslation();
  const activeModal = useUiStore((s) => s.activeModal);
  const setActiveModal = useUiStore((s) => s.setActiveModal);
  const currentDoc = useEditorStore((s) => s.currentDoc);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"current" | "global">("current");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [localResults, setLocalResults] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeModal === "search") {
      inputRef.current?.focus();
      setQuery("");
      setResults([]);
      setLocalResults([]);
    }
  }, [activeModal]);

  const searchLocal = useCallback(
    (q: string) => {
      if (!q.trim()) { setLocalResults([]); return; }
      const lines = currentDoc.split("\n");
      const matches: number[] = [];
      const lower = q.toLowerCase();
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(lower)) matches.push(i);
      }
      setLocalResults(matches);
    },
    [currentDoc],
  );

  const searchGlobal = useCallback(
    async (q: string) => {
      if (!q.trim()) { setResults([]); return; }
      const dir = useEditorStore.getState().currentFilePath?.split("/").slice(0, -1).join("/") || "/";
      try {
        const r = await api.searchFiles(dir, q);
        setResults(r);
      } catch { setResults([]); }
    },
    [],
  );

  const handleQuery = useCallback(
    (q: string) => {
      setQuery(q);
      if (tab === "current") searchLocal(q);
      else searchGlobal(q);
    },
    [tab, searchLocal, searchGlobal],
  );

  return (
    <Dialog open={activeModal === "search"} onOpenChange={(open) => { if (!open) setActiveModal(null); }}>
      <DialogContent className="w-[32rem] max-h-[32rem] p-0 gap-0">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab("current")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === "current" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Current File
          </button>
          <button
            onClick={() => setTab("global")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === "global" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Global Search
          </button>
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleQuery(e.target.value)}
          placeholder={tab === "current" ? t("searchCurrent") : t("searchAll")}
          className="px-4 py-2 border-b border-border bg-transparent outline-none text-sm"
        />
        <div className="flex-1 overflow-y-auto p-2 max-h-60">
          {tab === "current"
            ? localResults.map((line) => (
                <div key={line} className="px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer font-mono">
                  <span className="text-muted-foreground mr-2">{line + 1}</span>
                  {currentDoc.split("\n")[line].substring(0, 120)}
                </div>
              ))
            : results.map((r, i) => (
                <div key={i} className="px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer">
                  <div className="font-medium truncate">{r.file_path}</div>
                  <div className="text-muted-foreground text-xs truncate">{r.snippet}</div>
                </div>
              ))}
          {query && tab === "current" && localResults.length === 0 && <p className="text-sm text-muted-foreground p-2">No matches</p>}
          {query && tab === "global" && results.length === 0 && <p className="text-sm text-muted-foreground p-2">No matches</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
