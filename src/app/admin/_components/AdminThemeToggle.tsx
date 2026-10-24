"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const ADMIN_THEME_KEY = "admin-theme";

export default function AdminThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(ADMIN_THEME_KEY);
      if (stored === "light") {
        setTheme("light");
        const root = document.querySelector(".admin-root");
        if (root) {
          root.classList.add("light");
          root.classList.remove("dark");
          root.setAttribute("data-admin-theme", "light");
        }
      } else {
        setTheme("dark");
        const root = document.querySelector(".admin-root");
        if (root) {
          root.classList.remove("light");
          root.classList.add("dark");
          root.setAttribute("data-admin-theme", "dark");
        }
      }
    } catch {
      // Ignore localStorage security exceptions
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      localStorage.setItem(ADMIN_THEME_KEY, next);
    } catch {
      // Ignore
    }

    const root = document.querySelector(".admin-root");
    if (root) {
      if (next === "light") {
        root.classList.add("light");
        root.classList.remove("dark");
        root.setAttribute("data-admin-theme", "light");
      } else {
        root.classList.remove("light");
        root.classList.add("dark");
        root.setAttribute("data-admin-theme", "dark");
      }
    }
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className="a-focus flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm text-[var(--a-text-muted)] opacity-50"
        aria-label="Toggle admin day/night theme"
      >
        <Moon className="h-4 w-4" />
        {!compact && <span className="hidden sm:inline text-xs font-medium">Night</span>}
      </button>
    );
  }

  return (
    <button
      id="admin-theme-toggle"
      type="button"
      onClick={toggleTheme}
      className="a-focus flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm text-[var(--a-text-muted)] transition-colors hover:bg-[var(--a-surface-strong)] hover:text-[var(--a-text)]"
      title={theme === "light" ? "Switch to Night Mode" : "Switch to Day Mode"}
      aria-label={theme === "light" ? "Switch to Night Mode" : "Switch to Day Mode"}
    >
      {theme === "light" ? (
        <>
          <Sun className="h-4 w-4 text-amber-500 transition-transform duration-300 hover:rotate-45" />
          {!compact && <span className="hidden sm:inline text-xs font-medium">Day</span>}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-violet-400 transition-transform duration-300 hover:-rotate-12" />
          {!compact && <span className="hidden sm:inline text-xs font-medium">Night</span>}
        </>
      )}
    </button>
  );
}
