import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "../editorStore";

describe("editorStore", () => {
  beforeEach(() => {
    useEditorStore.setState({
      currentDoc: "",
      currentFilePath: null,
      editMode: "wysiwyg",
      isDirty: false,
    });
  });

  it("sets current document", () => {
    useEditorStore.getState().setCurrentDoc("# Hello", "/tmp/test.md");
    expect(useEditorStore.getState().currentDoc).toBe("# Hello");
    expect(useEditorStore.getState().currentFilePath).toBe("/tmp/test.md");
    expect(useEditorStore.getState().isDirty).toBe(false);
  });

  it("marks dirty on content change", () => {
    useEditorStore.getState().setCurrentDoc("# Hello", "/tmp/test.md");
    useEditorStore.getState().markDirty();
    expect(useEditorStore.getState().isDirty).toBe(true);
  });

  it("changes edit mode", () => {
    useEditorStore.getState().setEditMode("source");
    expect(useEditorStore.getState().editMode).toBe("source");
    useEditorStore.getState().setEditMode("split");
    expect(useEditorStore.getState().editMode).toBe("split");
    useEditorStore.getState().setEditMode("wysiwyg");
    expect(useEditorStore.getState().editMode).toBe("wysiwyg");
  });

  it("clears dirty flag on save", () => {
    useEditorStore.getState().setCurrentDoc("# Hello", "/tmp/test.md");
    useEditorStore.getState().markDirty();
    expect(useEditorStore.getState().isDirty).toBe(true);
    useEditorStore.getState().markClean();
    expect(useEditorStore.getState().isDirty).toBe(false);
  });
});
