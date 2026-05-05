import { useEffect, type ReactNode } from "react";
import { useConfigStore } from "../stores/configStore";

const themeUrls: Record<string, string> = {};
const themeModules = import.meta.glob("/src/themes/*.css", { query: "?url", import: "default", eager: true });
for (const [path, url] of Object.entries(themeModules)) {
  const id = path.split("/").pop()?.replace(".css", "");
  if (id) themeUrls[id] = url as string;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeMode = useConfigStore((s) => s.themeMode);
  const activeThemeId = useConfigStore((s) => s.activeThemeId);

  // Toggle .dark class
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === "dark") {
      root.classList.add("dark");
    } else if (themeMode === "light") {
      root.classList.remove("dark");
    } else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const apply = () => root.classList.toggle("dark", mq.matches);
      apply();
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [themeMode]);

  // Load theme CSS
  useEffect(() => {
    document.querySelectorAll("[id^='theme-']").forEach((el) => el.remove());

    if (activeThemeId === "github") return;

    // Check if it's a custom theme from localStorage
    if (activeThemeId.startsWith("custom-")) {
      const stored = JSON.parse(localStorage.getItem("bottle-themes") || "{}");
      const theme = stored[activeThemeId];
      if (!theme?.css) return;
      const style = document.createElement("style");
      style.id = `theme-${activeThemeId}`;
      style.textContent = theme.css;
      document.head.appendChild(style);
      return () => style.remove();
    }

    // Built-in theme from src/themes/
    const url = themeUrls[activeThemeId];
    if (!url) return;

    const link = document.createElement("link");
    link.id = `theme-${activeThemeId}`;
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);

    return () => link.remove();
  }, [activeThemeId]);

  return <>{children}</>;
}
