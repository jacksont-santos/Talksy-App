import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

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
    <div
      onClick={() => setDark(!dark)}
      className="
        font-bold text-sm text-gray-800 dark:text-gray-200
        flex flex-col items-center rounded transition-colors cursor-pointer
      "
    >
      {dark ? (
        <>
        <Sun size={20} fill="#ffff32" color="#ffff32"/>
        Claro
        </>
      ) : (
        <>
        <Moon size={20} fill="#e2e22d" color="#e2e22d"/>
        Escuro
        </>
      )}
    </div>
  );
}
