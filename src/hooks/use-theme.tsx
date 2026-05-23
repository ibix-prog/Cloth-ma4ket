import { useState, useEffect } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem("shahi-theme");
      if (stored === "light" || stored === "dark") return stored;
    } catch {}
    return "light";
  });

  useEffect(() => {
    localStorage.setItem("shahi-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

  return { theme, toggleTheme };
}
