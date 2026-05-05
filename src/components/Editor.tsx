import { useEffect, useRef, useCallback, useState } from "react";
import { Editor as MilkdownEditor, rootCtx, defaultValueCtx } from "@milkdown/kit/core";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";
import { nord } from "@milkdown/theme-nord";
import { clipboard } from "@milkdown/kit/plugin/clipboard";
import { history } from "@milkdown/kit/plugin/history";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { math } from "@milkdown/plugin-math";
import { diagram } from "@milkdown/plugin-diagram";
import { highlight, highlightPluginConfig } from "@milkdown/plugin-highlight";
import { createParser } from "@milkdown/plugin-highlight/shiki";
import { upload, uploadConfig } from "@milkdown/plugin-upload";
import { useEditorStore } from "../stores/editorStore";
import { useFileStore } from "../stores/fileStore";
import { api } from "../api";

export function Editor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MilkdownEditor | null>(null);
  const currentDoc = useEditorStore((s) => s.currentDoc);
  const editMode = useEditorStore((s) => s.editMode);
  const [, forceRender] = useState(0);

  const createEditor = useCallback(async () => {
    if (!containerRef.current || editorRef.current) return;

    const parser = await createParser({
      theme: "github-dark",
      langs: [
        "javascript", "typescript", "python", "rust", "html", "css",
        "json", "yaml", "bash", "sql", "markdown", "java", "go", "c", "cpp",
      ],
    });

    // nord is a Config function, use .config() for themes and config callbacks.
    // All other items are MilkdownPlugin(s), use .use() for those.
    // TypeScript casts are used where Milkdown v7's type system differs from
    // the runtime API; the JS output is correct regardless.
    const editor = await MilkdownEditor.make()
      .config((ctx: any) => {
        ctx.set(rootCtx, containerRef.current!);
        ctx.set(defaultValueCtx, currentDoc);
        ctx.set(highlightPluginConfig.key, { parser });
        ctx.set(uploadConfig.key, {
          enableHtmlFileUploader: false,
          uploadWidgetFactory: () => null,
          uploader: async (files: FileList, schema: any) => {
            const workspaceDir = useFileStore.getState().workspaceDir;
            if (!workspaceDir) throw new Error("No workspace open");
            const nodes: any[] = [];
            for (const file of Array.from(files)) {
              const buffer = await file.arrayBuffer();
              const data = Array.from(new Uint8Array(buffer));
              const relativePath = await api.saveImage(
                data,
                file.name,
                workspaceDir,
              );
              const node = schema.nodes.image.create({
                src: relativePath,
                alt: file.name,
              });
              nodes.push(node);
            }
            return nodes;
          },
        });
        ctx.get(listenerCtx).markdownUpdated((_ctx: any, md: string) => {
          useEditorStore.getState().updateDoc(md);
        });
      })
      .config(nord)
      .use(commonmark)
      .use(gfm)
      .use(history)
      .use(clipboard)
      .use(listener)
      .use(math)
      .use(diagram)
      .use(highlight)
      .use(upload)
      .create();

    editorRef.current = editor;
    forceRender(1);
  }, []);

  useEffect(() => {
    createEditor();
    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, [createEditor]);

  // Source mode: plain textarea
  const handleSourceChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      useEditorStore.getState().updateDoc(e.target.value);
    },
    [],
  );

  if (editMode === "source") {
    return (
      <textarea
        value={currentDoc}
        onChange={handleSourceChange}
        className="w-full h-full p-4 font-mono text-sm bg-muted/10 resize-none outline-none border-0"
        spellCheck={false}
      />
    );
  }

  // Split mode: source left, preview right
  if (editMode === "split") {
    return (
      <div className="flex w-full h-full">
        <textarea
          value={currentDoc}
          onChange={handleSourceChange}
          className="w-1/2 h-full p-4 font-mono text-sm bg-muted/10 resize-none outline-none border-r border-border"
          spellCheck={false}
        />
        <div className="w-1/2 h-full overflow-auto p-4 prose prose-sm dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {currentDoc}
          </pre>
        </div>
      </div>
    );
  }

  // WYSIWYG mode
  return (
    <div
      ref={containerRef}
      className="editor-content w-full h-full overflow-auto"
      style={{ padding: "var(--md-padding, 32px)" }}
      data-edit-mode="wysiwyg"
    />
  );
}
