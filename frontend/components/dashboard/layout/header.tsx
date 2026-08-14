"use client";

import { Menu, Calendar } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between md:justify-end px-6 sticky top-0 z-10">
      {/* Mobile Menu Toggle */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Real Date */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm transition-all hidden md:flex">
          <Calendar className="w-4 h-4 text-indigo-600" />
          {mounted ? (
            new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          ) : (
            <span className="opacity-0">Loading...</span>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1"></div>

        {/* User Profile & Logout */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-10 h-10 shadow-sm border border-slate-200",
            },
          }}
        />
      </div>
    </header>
  );
}
