"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Target,
  Mic,
  Share2,
  Video,
  Library,
  History,
  X,
  ScanSearch,
} from "lucide-react";
import { useEffect } from "react";

const MAIN_LINKS = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Resume Analysis", href: "/dashboard/ats", icon: FileText },
  { name: "Mock Interview", href: "/dashboard/mock-interview", icon: Mic },
  { name: "History", href: "/dashboard/history", icon: History },
];

const ADVANCED_TOOLS = [
  {
    name: "Resume Builder",
    href: "/dashboard/ai-resume-builder",
    icon: Target,
  },
  {
    name: "ATS Match Engine",
    href: "/dashboard/ats-match",
    icon: ScanSearch,
  },
  { name: "Question Bank", href: "/dashboard/question-bank", icon: Library },
  { name: "Video Interview", href: "/dashboard/video-interview", icon: Video },
  { name: "Share Reports", href: "/dashboard/share-reports", icon: Share2 },
];

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export function Sidebar({ isOpen = false, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen?.(false);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 w-64 flex-shrink-0 border-r border-slate-200 bg-white h-[100dvh] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 group"
            onClick={closeMenu}
          >
            <div className="group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Resumind Logo" width={32} height={32} className="object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                Resumind
              </h1>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={closeMenu}
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
          <nav className="space-y-6">
            {/* MAIN GROUP */}
            <div>
              <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Main
              </h3>
              <div className="space-y-1">
                {MAIN_LINKS.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/dashboard" &&
                      pathname.startsWith(link.href));
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 font-bold shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                      />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ADVANCED TOOLS GROUP */}
            <div>
              <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Advanced Tools
              </h3>
              <div className="space-y-1">
                {ADVANCED_TOOLS.map((link) => {
                  const isActive =
                    pathname === link.href || pathname.startsWith(link.href);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 font-bold shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                      />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
