import { create } from "zustand";
import type { ActiveModal, Platform } from "../types";

interface UiState {
  sidebarOpen: boolean;
  activeModal: ActiveModal;
  platform: Platform;
  isMaximized: boolean;
  toggleSidebar: () => void;
  setActiveModal: (modal: ActiveModal) => void;
  setPlatform: (platform: Platform) => void;
  setIsMaximized: (maximized: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  activeModal: null,
  platform: "unknown",
  isMaximized: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveModal: (modal) =>
    set((s) => ({ activeModal: s.activeModal === modal ? null : modal })),
  setPlatform: (platform) => set({ platform }),
  setIsMaximized: (maximized) => set({ isMaximized: maximized }),
}));
