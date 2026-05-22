import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
