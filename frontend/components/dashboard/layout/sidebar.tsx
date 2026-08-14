'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Target, Mic, Share2, Video, Library } from "lucide-react";
import Image from "next/image";

const mainLinks = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "ATS Score Checker", href: "/dashboard/ats", icon: FileText },
  {
    name: "AI Resume Builder",
    href: "/dashboard/ai-resume-builder",
    icon: Target,
  },
  {
    name: "ATS Match Engine",
    href: "/dashboard/ats-match",
    icon: Target,
  },
  { name: "Question Bank", href: "/dashboard/question-bank", icon: Library },
  { name: "Mock Interview", href: "/dashboard/mock-interview", icon: Mic },
  { name: "Video Interview", href: "/dashboard/video-interview", icon: Video },
  { name: "Share Reports", href: "/dashboard/share-reports", icon: Share2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white h-screen flex flex-col transition-all duration-300 hidden md:flex sticky top-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="group-hover:scale-105 transition-transform">
            <Image src="/logo.png" alt="Resumind Logo" width={32} height={32} className="object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Resumind</h1>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">AI Career Assistant</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
        <nav className="space-y-1.5">
          {mainLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
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
        </nav>
      </div>
    </aside>
  );
}
