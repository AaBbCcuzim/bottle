import { create } from "zustand";
import type { ThemeMode, ActiveModal } from "../types";

type Page = "editor" | "settings";

interface UiState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  activeModal: ActiveModal;
  page: Page;
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  setActiveModal: (modal: ActiveModal) => void;
  setPage: (page: Page) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: "system",
  sidebarOpen: true,
  activeModal: null,
  page: "editor",
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveModal: (modal) =>
    set((s) => ({ activeModal: s.activeModal === modal ? null : modal })),
  setPage: (page) => set({ page }),
}));
