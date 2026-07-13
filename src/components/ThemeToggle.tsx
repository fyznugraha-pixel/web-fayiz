"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-1 bg-white/80 dark:bg-[#0C0C14]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full p-1 shadow-lg transition-colors">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-full transition-colors ${
          theme === "light"
            ? "bg-slate-200 text-slate-900"
            : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
        }`}
        aria-label="Light Mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-full transition-colors ${
          theme === "system"
            ? "bg-slate-200 text-slate-900 dark:bg-white/15 dark:text-white"
            : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
        }`}
        aria-label="System Preference"
      >
        <Monitor className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-full transition-colors ${
          theme === "dark"
            ? "bg-white/15 text-white"
            : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
        }`}
        aria-label="Dark Mode"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
