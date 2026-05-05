import { create } from "zustand";
import { api } from "../api";
import type { ThemeMode } from "../types";

interface ConfigState {
  fileExtensions: string[];
  loaded: boolean;
  activeThemeId: string;
  themeMode: ThemeMode;
  loadConfig: () => Promise<void>;
  setFileExtensions: (extensions: string[]) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setActiveTheme: (themeId: string) => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  fileExtensions: ["md"],
  loaded: false,
  activeThemeId: "github",
  themeMode: "system",

  loadConfig: async () => {
    try {
      const config = await api.getConfig();
      let themeMode: ThemeMode = "system";
      if (config.theme_mode) {
        themeMode = config.theme_mode as ThemeMode;
      } else {
        const stored = localStorage.getItem("bottle-ui");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.state?.theme) {
              themeMode = parsed.state.theme;
            }
          } catch { /* ignore */ }
        }
      }
      set({
        fileExtensions: config.file_extensions,
        activeThemeId: config.active_theme_id || "github",
        themeMode,
        loaded: true,
      });
    } catch (e) {
      console.error("Failed to load config:", e);
      set({ loaded: true });
    }
  },

  setFileExtensions: async (extensions: string[]) => {
    set({ fileExtensions: extensions });
    try {
      const state = get();
      await api.setConfig({
        file_extensions: extensions,
        active_theme_id: state.activeThemeId,
        theme_mode: state.themeMode,
      });
    } catch (e) {
      console.error("Failed to save file extensions:", e);
    }
  },

  setThemeMode: async (mode) => {
    set({ themeMode: mode });
    try {
      const state = get();
      await api.setConfig({
        file_extensions: state.fileExtensions,
        active_theme_id: state.activeThemeId,
        theme_mode: mode,
      });
    } catch (e) {
      console.error("Failed to save theme mode:", e);
    }
  },

  setActiveTheme: async (themeId) => {
    set({ activeThemeId: themeId });
    try {
      const state = get();
      await api.setConfig({
        file_extensions: state.fileExtensions,
        active_theme_id: themeId,
        theme_mode: state.themeMode,
      });
    } catch (e) {
      console.error("Failed to save active theme:", e);
    }
  },
}));
