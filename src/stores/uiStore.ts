import { create } from "zustand";
import type { ThemeMode, ActiveModal } from "../types";

interface UiState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  activeModal: ActiveModal;
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  setActiveModal: (modal: ActiveModal) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: "system",
  sidebarOpen: true,
  activeModal: null,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveModal: (modal) =>
    set((s) => ({ activeModal: s.activeModal === modal ? null : modal })),
}));
