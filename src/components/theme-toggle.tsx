"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Simple theme toggle button.
 * It toggles the `.dark` class on the document element and persists the choice in localStorage.
 * The persisted value takes precedence over the OS colour‑scheme preference handled by ThemeSync.
 */
export function ThemeToggle() {
  // Determine initial theme based on persisted value or OS preference.
  const getInitialDark = () => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    // Fallback to system preference.
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [isDark, setIsDark] = useState<boolean>(getInitialDark());

  // Apply the class and persist whenever the state changes.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Keep the toggle in sync if the user changes the OS preference and no explicit choice is stored.
  useEffect(() => {
    const query = "(prefers-color-scheme: dark)";
    const media = window.matchMedia(query);
    const handleChange = (e) => {
      if (!localStorage.getItem("theme")) {
        setIsDark(e.matches);
      }
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setIsDark((prev) => !prev)}
      aria-label="Toggle theme"
    >
      {/* Sun for light mode, Moon for dark mode – animated transition */}
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all ${isDark ? "scale-0 rotate-90" : "scale-100 rotate-0"}`}
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] absolute transition-all ${isDark ? "scale-100 rotate-0" : "scale-0 rotate-90"}`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
