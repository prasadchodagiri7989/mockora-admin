import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FolderTree, 
  GraduationCap, 
  Dumbbell, 
  BookOpen, 
  Briefcase, 
  BarChart3, 
  ShieldCheck, 
  X,
  ExternalLink,
  Receipt,
  MessageSquare,
  Tag
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard Overview', path: '/', icon: LayoutDashboard },
  { name: 'Transactions & Orders', path: '/transactions', icon: Receipt },
  { name: 'Coupons & Discounts', path: '/coupons', icon: Tag },
  { name: 'Chat Messages', path: '/chat', icon: MessageSquare },
  { name: 'User Management', path: '/users', icon: Users },
  { name: 'Exam Categories', path: '/categories', icon: FolderTree },
  { name: 'Mock Test Manager', path: '/tests', icon: GraduationCap },
  { name: 'Practice Question Bank', path: '/practice', icon: Dumbbell },
  { name: 'Study Resources', path: '/resources', icon: BookOpen },
  { name: 'Job Postings', path: '/jobs', icon: Briefcase },
  { name: 'Platform Analytics', path: '/analytics', icon: BarChart3 },
];

export default function AdminSidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <img src="/mockora-logo.png" alt="MockOra Admin" className="h-8 w-auto object-contain" />
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20">
              Admin
            </span>
          </Link>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Admin Controls
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Portal Link */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <a
            href={import.meta.env.VITE_USER_URL || 'http://localhost:5173'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition group"
          >
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                Student Portal
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                View candidate experience
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
          </a>
        </div>
      </aside>
    </>
  );
}
