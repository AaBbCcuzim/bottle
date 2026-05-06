import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { Editor as MilkdownEditor, rootCtx, defaultValueCtx } from "@milkdown/kit/core";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";
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
import { marked } from "marked";
import { createHighlighter } from "shiki";

const THEME = "github-dark";
const LANGS = [
  "javascript", "typescript", "python", "rust", "html", "css",
  "json", "yaml", "bash", "sql", "markdown", "java", "go", "c", "cpp",
];

let highlighterPromise: Promise<Awaited<ReturnType<typeof createHighlighter>>> | null = null;
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEME],
      langs: LANGS,
    });
  }
  return highlighterPromise;
}

export function Editor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MilkdownEditor | null>(null);
  const generationRef = useRef(0);
  const currentDoc = useEditorStore((s) => s.currentDoc);
  const editMode = useEditorStore((s) => s.editMode);
  const [, forceRender] = useState(0);

  const createEditor = useCallback(async () => {
    if (!containerRef.current) return;
    const gen = ++generationRef.current;

    const highlighter = await getHighlighter();
    const parser = createParser(highlighter, { theme: THEME });
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

    // Guard against StrictMode double-mount race: if a newer generation
    // was started while this one was being created, discard this editor.
    if (gen !== generationRef.current) {
      editor.destroy();
      return;
    }
    editorRef.current?.destroy();
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

  const renderedHtml = useMemo(() => {
    if (!currentDoc) return "";
    return marked.parse(currentDoc, { async: false }) as string;
  }, [currentDoc]);

  const [highlightedHtml, setHighlightedHtml] = useState("");
  const highlightGen = useRef(0);

  useEffect(() => {
    if (editMode !== "split" || !renderedHtml) {
      setHighlightedHtml(renderedHtml);
      return;
    }
    const gen = ++highlightGen.current;

    Promise.all([
      getHighlighter(),
      import("mermaid"),
    ]).then(([highlighter, mermaid]) => {
      if (gen !== highlightGen.current) return;

      mermaid.default.initialize({ startOnLoad: false });

      const doc = new DOMParser().parseFromString(renderedHtml, "text/html");
      const codeBlocks = doc.querySelectorAll("pre code");
      const mermaidTasks: Promise<void>[] = [];
      let mermaidIndex = 0;

      codeBlocks.forEach((codeEl) => {
        const pre = codeEl.closest("pre");
        if (!pre) return;
        const code = codeEl.textContent || "";
        const lang =
          [...codeEl.classList]
            .find((c) => c.startsWith("language-"))
            ?.replace("language-", "") || "text";

        if (lang === "mermaid") {
          const id = `mermaid-${gen}-${mermaidIndex++}`;
          mermaidTasks.push(
            mermaid.default.render(id, code).then(({ svg }) => {
              pre.outerHTML = svg;
            }).catch(() => {}),
          );
          return;
        }

        try {
          const html = highlighter.codeToHtml(code, { lang, theme: THEME });
          const temp = new DOMParser().parseFromString(html, "text/html");
          const hl = temp.querySelector("pre");
          if (hl) pre.replaceWith(hl);
        } catch { /* keep original */ }
      });

      (mermaidTasks.length ? Promise.all(mermaidTasks) : Promise.resolve())
        .then(() => {
          if (gen !== highlightGen.current) return;
          setHighlightedHtml(doc.body.innerHTML);
        });
    });
  }, [editMode, renderedHtml]);

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
        <div
          className="w-1/2 h-full overflow-auto p-4 prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: highlightedHtml || renderedHtml }}
        />
      </div>
    );
  }

  // WYSIWYG mode
  return (
    <div
      ref={containerRef}
      className="editor-content w-full h-full overflow-auto prose prose-sm dark:prose-invert max-w-none"
      style={{ padding: "var(--md-padding, 64px)" }}
      data-edit-mode="wysiwyg"
    />
  );
}
