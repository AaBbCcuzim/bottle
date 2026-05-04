import { describe, it, expect, beforeEach, vi } from "vitest";
import { useFileStore } from "../fileStore";

// Mock Tauri API
vi.mock("../../api", () => ({
  api: {
    openFile: vi.fn().mockResolvedValue("# mock content"),
    saveFile: vi.fn().mockResolvedValue(undefined),
    listDir: vi.fn().mockResolvedValue({
      name: "ws",
      path: "/ws",
      is_dir: true,
      children: [
        { name: "notes", path: "/ws/notes", is_dir: true, children: [] },
        { name: "readme.md", path: "/ws/readme.md", is_dir: false, children: [] },
      ],
    }),
    createFile: vi.fn().mockResolvedValue("/ws/new.md"),
    renameFile: vi.fn().mockResolvedValue("/ws/renamed.md"),
    deleteFile: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("fileStore", () => {
  beforeEach(() => {
    useFileStore.setState({
      fileTree: null,
      activeFilePath: null,
      workspaceDir: null,
      openRecent: [],
    });
  });

  it("sets workspace", () => {
    useFileStore.getState().setWorkspace("/Users/test/notes");
    expect(useFileStore.getState().workspaceDir).toBe("/Users/test/notes");
  });

  it("adds to recent files (dedup + max 10)", () => {
    const store = useFileStore.getState();
    store.addRecent("/a.md");
    store.addRecent("/b.md");
    store.addRecent("/a.md");
    expect(useFileStore.getState().openRecent).toEqual(["/a.md", "/b.md"]);
  });

  it("caps recent files at 10", () => {
    const store = useFileStore.getState();
    for (let i = 0; i < 15; i++) {
      store.addRecent(`/file${i}.md`);
    }
    expect(useFileStore.getState().openRecent.length).toBe(10);
  });

  it("clears file state on close workspace", () => {
    useFileStore.setState({
      fileTree: {
        name: "ws",
        path: "/ws",
        is_dir: true,
        children: [{ name: "a.md", path: "/a.md", is_dir: false, children: [] }],
      },
      activeFilePath: "/a.md",
    });
    useFileStore.getState().closeWorkspace();
    const s = useFileStore.getState();
    expect(s.fileTree).toBeNull();
    expect(s.activeFilePath).toBeNull();
    expect(s.workspaceDir).toBeNull();
  });
});
