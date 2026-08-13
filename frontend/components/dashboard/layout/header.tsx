'use client';

import { Search, Moon, Bell, Share } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-16 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
            placeholder="Search roles, resumes, skills..."
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Share Feedback Report */}
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all">
          <Share className="w-4 h-4 text-indigo-600" />
          Share Feedback Report
        </button>
      </div>
    </header>
  );
}
