import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "Home", path: "/" },
  { label: "History", path: "/history" },
];

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">AI Content Summarizer</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Summarize articles, notes, and PDF text quickly.</p>
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-3">
            {links.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
