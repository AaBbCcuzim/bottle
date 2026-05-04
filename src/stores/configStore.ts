import { create } from "zustand";
import { api } from "../api";

interface ConfigState {
  fileExtensions: string[];
  loaded: boolean;
  loadConfig: () => Promise<void>;
  setFileExtensions: (extensions: string[]) => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  fileExtensions: ["md"],
  loaded: false,
  loadConfig: async () => {
    try {
      const config = await api.getConfig();
      set({ fileExtensions: config.file_extensions, loaded: true });
    } catch (e) {
      console.error("Failed to load config:", e);
      set({ loaded: true });
    }
  },
  setFileExtensions: async (extensions: string[]) => {
    set({ fileExtensions: extensions });
    try {
      await api.setConfig({ file_extensions: extensions });
    } catch (e) {
      console.error("Failed to save config:", e);
    }
  },
}));
