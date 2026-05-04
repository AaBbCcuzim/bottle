import { create } from "zustand";
import type { ThemeMode, ActiveModal, Platform } from "../types";

type Page = "editor" | "settings";

interface UiState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  activeModal: ActiveModal;
  page: Page;
  platform: Platform;
  isMaximized: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  setActiveModal: (modal: ActiveModal) => void;
  setPage: (page: Page) => void;
  setPlatform: (platform: Platform) => void;
  setIsMaximized: (maximized: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: "system",
  sidebarOpen: true,
  activeModal: null,
  page: "editor",
  platform: "unknown",
  isMaximized: false,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveModal: (modal) =>
    set((s) => ({ activeModal: s.activeModal === modal ? null : modal })),
  setPage: (page) => set({ page }),
  setPlatform: (platform) => set({ platform }),
  setIsMaximized: (maximized) => set({ isMaximized: maximized }),
}));
