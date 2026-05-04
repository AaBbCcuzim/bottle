import { useState } from "react";
import type { FileEntry } from "../types";

interface FileTreeProps {
  files: FileEntry[];
  activePath: string | null;
  onSelect: (path: string) => void;
  onCreate: (parentDir: string) => void;
  onRename: (oldPath: string) => void;
  onDelete: (path: string) => void;
}

export function FileTree({
  files,
  activePath,
  onSelect,
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
              >
                <span className="text-xs w-3">
                  {expanded[file.path] ? "▾" : "▸"}
                </span>
                <span>📁 {file.name}</span>
              </button>
              {expanded[file.path] && (
                <div className="text-xs text-muted-foreground px-5 py-0.5">
                  (expandable in future)
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => onSelect(file.path)}
              className={`flex items-center gap-1 w-full px-3 py-1 text-sm hover:bg-muted text-left ${
                activePath === file.path ? "bg-muted" : ""
              }`}
            >
              <span className="text-xs w-3" />
              <span>📄 {file.name}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
