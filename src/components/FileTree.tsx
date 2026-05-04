import { useState } from "react";
import type { FileEntry } from "../types";

interface FileTreeProps {
  files: FileEntry[];
  activePath: string | null;
  depth?: number;
  onSelect: (path: string) => void;
  onCreate: (parentDir: string) => void;
  onRename: (oldPath: string) => void;
  onDelete: (path: string) => void;
}

export function FileTree({
  files,
  activePath,
  depth = 0,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: FileTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <div className="flex flex-col py-1">
      {files.map((file) => (
        <div key={file.path}>
          {file.is_dir ? (
            <>
              <button
                onClick={() =>
                  setExpanded((e) => ({ ...e, [file.path]: !e[file.path] }))
                }
                className="flex items-center gap-1 w-full px-3 py-1 text-sm hover:bg-muted text-left"
                style={{ paddingLeft: `${12 + depth * 16}px` }}
              >
                <span className="text-xs w-3 shrink-0">
                  {expanded[file.path] ? "▾" : "▸"}
                </span>
                <span className="shrink-0">📁</span>
                <span className="truncate">{file.name}</span>
              </button>
              {expanded[file.path] && file.children.length > 0 && (
                <FileTree
                  files={file.children}
                  activePath={activePath}
                  depth={depth + 1}
                  onSelect={onSelect}
                  onCreate={onCreate}
                  onRename={onRename}
                  onDelete={onDelete}
                />
              )}
              {expanded[file.path] && file.children.length === 0 && (
                <div
                  className="text-xs text-muted-foreground px-3 py-0.5 italic"
                  style={{ paddingLeft: `${28 + depth * 16}px` }}
                >
                  (empty)
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => onSelect(file.path)}
              className={`flex items-center gap-1 w-full px-3 py-1 text-sm hover:bg-muted text-left ${
                activePath === file.path ? "bg-muted" : ""
              }`}
              style={{ paddingLeft: `${12 + depth * 16}px` }}
            >
              <span className="text-xs w-3 shrink-0" />
              <span className="shrink-0">📄</span>
              <span className="truncate">{file.name}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
