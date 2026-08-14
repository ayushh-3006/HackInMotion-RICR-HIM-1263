'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Target,
  Mic,
  BarChart2,
  PenTool,
  ShieldCheck,
  BookOpen,
  Share2,
  ChevronUp
} from 'lucide-react';


const mainLinks = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'ATS Score Checker', href: '/dashboard/ats', icon: FileText },
  { name: 'AI Resume Builder', href: '/dashboard/ai-resume-builder', icon: Target },
  { name: 'Resume Enhancer', href: '/dashboard/mock-interview', icon: Mic },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
];

const secondaryLinks = [
  { name: 'Resume Rewriter', href: '/dashboard/resume-rewriter', icon: PenTool },
  { name: 'ATS Compatibility', href: '/dashboard/ats-compatibility', icon: ShieldCheck },
  { name: 'Question Bank', href: '/dashboard/question-bank', icon: BookOpen },
  { name: 'Share Reports', href: '/dashboard/share-reports', icon: Share2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white h-screen flex flex-col transition-all duration-300 hidden md:flex sticky top-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5Z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">CareerAI</h1>
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
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8">
          <h2 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Tools & Extras
          </h2>
          <nav className="space-y-1.5">
            {secondaryLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

    </aside>
  );
}
