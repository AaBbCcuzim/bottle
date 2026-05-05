import { describe, it, expect, beforeEach, vi } from "vitest";
import { useConfigStore } from "../configStore";

vi.mock("../../api", () => ({
  api: {
    getConfig: vi.fn().mockResolvedValue({
      file_extensions: ["md", "txt"],
      active_theme_id: "",
      theme_mode: "",
    }),
    setConfig: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("configStore", () => {
  beforeEach(() => {
    useConfigStore.setState({
      fileExtensions: ["md"],
      loaded: false,
      activeThemeId: "github",
      themeMode: "system",
    });
  });

  it("loads config from backend", async () => {
    await useConfigStore.getState().loadConfig();
    const state = useConfigStore.getState();
    expect(state.loaded).toBe(true);
    expect(state.fileExtensions).toEqual(["md", "txt"]);
    expect(state.activeThemeId).toBe("github");
    expect(state.themeMode).toBe("system");
  });

  it("loads config with saved theme fields", async () => {
    const { api } = await import("../../api");
    vi.mocked(api.getConfig).mockResolvedValueOnce({
      file_extensions: ["md"],
      active_theme_id: "nord",
      theme_mode: "dark",
    });

    await useConfigStore.getState().loadConfig();
    const state = useConfigStore.getState();
    expect(state.activeThemeId).toBe("nord");
    expect(state.themeMode).toBe("dark");
  });

  it("sets theme mode and persists", async () => {
    await useConfigStore.getState().setThemeMode("dark");
    expect(useConfigStore.getState().themeMode).toBe("dark");
  });

  it("sets active theme", async () => {
    await useConfigStore.getState().setActiveTheme("nord");
    expect(useConfigStore.getState().activeThemeId).toBe("nord");
  });

  it("handles loadConfig failure gracefully", async () => {
    const { api } = await import("../../api");
    vi.mocked(api.getConfig).mockRejectedValueOnce(new Error("fail"));

    await useConfigStore.getState().loadConfig();
    expect(useConfigStore.getState().loaded).toBe(true);
    expect(useConfigStore.getState().fileExtensions).toEqual(["md"]);
  });
});
