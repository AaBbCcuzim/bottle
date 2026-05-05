import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "../editorStore";

describe("persist", () => {
  beforeEach(() => {
    localStorage.clear();
    useEditorStore.setState({
      currentDoc: "",
      currentFilePath: null,
      editMode: "wysiwyg",
      isDirty: false,
    });
  });

  it("persists editMode to localStorage", () => {
    useEditorStore.getState().setEditMode("source");

    const stored = JSON.parse(localStorage.getItem("bottle-editor") || "{}");
    expect(stored.state?.editMode).toBe("source");
  });
});
