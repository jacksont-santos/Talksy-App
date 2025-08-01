// src/components/ThemeToggle.tsx
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="
        font-bold text-sm text-gray-800 dark:text-gray-200
        flex items-center px-3 py-1 rounded transition-colors
      "
    >
      {dark ? "☀️ Claro" : "🌙 Escuro"}
    </button>
  );
}
