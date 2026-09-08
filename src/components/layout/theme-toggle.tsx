"use client";

import { useState, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("credex.theme") as "dark" | "light") || "dark";
  });

  function applyTheme(t: "dark" | "light") {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(t);
    root.setAttribute("data-theme", t);
    localStorage.setItem("credex.theme", t);
  }

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  if (!mounted) {
    return <div className="size-9" aria-hidden="true" />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="theme-toggle flex size-9 items-center justify-center rounded-full border border-border bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
    >
      {theme === "dark" ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
