import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EditMode } from "../types";

interface EditorState {
  currentDoc: string;
  currentFilePath: string | null;
  editMode: EditMode;
  isDirty: boolean;
  setCurrentDoc: (doc: string, path: string | null) => void;
  updateDoc: (doc: string) => void;
  setEditMode: (mode: EditMode) => void;
  markDirty: () => void;
  markClean: () => void;
  clearDoc: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      currentDoc: "",
      currentFilePath: null,
      editMode: "wysiwyg",
      isDirty: false,
      setCurrentDoc: (doc, path) =>
        set({ currentDoc: doc, currentFilePath: path, isDirty: false }),
      updateDoc: (doc) => set({ currentDoc: doc, isDirty: true }),
      setEditMode: (mode) => set({ editMode: mode }),
      markDirty: () => set({ isDirty: true }),
      markClean: () => set({ isDirty: false }),
      clearDoc: () =>
        set({ currentDoc: "", currentFilePath: null, isDirty: false }),
    }),
    {
      name: "bottle-editor",
      partialize: (state) => ({ editMode: state.editMode }),
    },
  ),
);
