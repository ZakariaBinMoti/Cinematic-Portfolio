"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({
  className = "",
  showLabel = true,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("portfolio-theme");
    if (stored === "light") {
      setTheme("light");
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);

    document.documentElement.setAttribute("data-theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }

    try {
      localStorage.setItem("portfolio-theme", nextTheme);
      window.dispatchEvent(new Event("portfolio-theme-change"));
    } catch {
      // Ignore if localStorage unavailable
    }
  };

  if (!mounted) {
    // Return empty placeholder with same dimensions to avoid layout shift
    return (
      <div
        className={`h-9 w-32 rounded-full border border-white/10 bg-white/[0.04] opacity-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      id="portfolio-theme-toggle"
      aria-label={isLight ? "Switch to Dark / Night Mode" : "Switch to Day / White Mode"}
      title={isLight ? "Switch to Dark / Night Mode" : "Switch to Day / White Mode"}
      className={`group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f6602d] active:scale-95 ${
        isLight
          ? "border border-slate-300 bg-white text-slate-800 shadow-md hover:border-slate-400 hover:bg-slate-50"
          : "border border-white/10 bg-white/[0.05] text-gray-300 shadow-lg hover:border-white/20 hover:bg-white/[0.1] hover:text-white"
      } ${className}`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-12 ${
          isLight ? "bg-amber-100 text-amber-600" : "bg-white/10 text-amber-300"
        }`}
      >
        {isLight ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
      {showLabel && (
        <span className="font-mono tracking-wider">
          {isLight ? "Night Mode" : "Day Mode"}
        </span>
      )}
    </button>
  );
}
