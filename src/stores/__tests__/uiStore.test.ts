import { describe, it, expect, beforeEach } from "vitest";
import { useUiStore } from "../uiStore";

describe("uiStore", () => {
  beforeEach(() => {
    useUiStore.setState({
      sidebarOpen: true,
      activeModal: null,
      platform: "unknown",
      isMaximized: false,
    });
  });

  it("toggles sidebar", () => {
    expect(useUiStore.getState().sidebarOpen).toBe(true);
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(false);
  });

  it("sets active modal", () => {
    useUiStore.getState().setActiveModal("search");
    expect(useUiStore.getState().activeModal).toBe("search");
    useUiStore.getState().setActiveModal(null);
    expect(useUiStore.getState().activeModal).toBeNull();
  });

  it("closes modal when setting same modal", () => {
    useUiStore.getState().setActiveModal("outline");
    useUiStore.getState().setActiveModal("outline");
    expect(useUiStore.getState().activeModal).toBeNull();
  });

  it("sets platform", () => {
    useUiStore.getState().setPlatform("macos");
    expect(useUiStore.getState().platform).toBe("macos");
    useUiStore.getState().setPlatform("windows");
    expect(useUiStore.getState().platform).toBe("windows");
  });

  it("sets isMaximized", () => {
    useUiStore.getState().setIsMaximized(true);
    expect(useUiStore.getState().isMaximized).toBe(true);
    useUiStore.getState().setIsMaximized(false);
    expect(useUiStore.getState().isMaximized).toBe(false);
  });
});
