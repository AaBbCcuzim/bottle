import { describe, it, expect, beforeEach } from "vitest";
import { useUiStore } from "../uiStore";

describe("uiStore", () => {
  beforeEach(() => {
    useUiStore.setState({
      theme: "system",
      sidebarOpen: true,
      activeModal: null,
    });
  });

  it("toggles theme", () => {
    useUiStore.getState().setTheme("dark");
    expect(useUiStore.getState().theme).toBe("dark");
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
});
