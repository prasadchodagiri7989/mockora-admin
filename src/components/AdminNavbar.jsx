import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Menu, ShieldCheck, ExternalLink } from 'lucide-react';

export default function AdminNavbar({ onToggleSidebar }) {
  const { admin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200/60 dark:border-rose-900/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Switch to User Portal Link */}
        <a
          href={import.meta.env.VITE_USER_URL || 'http://localhost:5173'}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <span>Open Student Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
            {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {admin?.name}
            </p>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5">
              Super Administrator
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
