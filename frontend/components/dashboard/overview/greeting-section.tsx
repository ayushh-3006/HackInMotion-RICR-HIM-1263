'use client';

import { CheckCircle2 } from 'lucide-react';

export function GreetingSection({ userName = "Anit" }: { userName?: string }) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
        Welcome back, {userName}
      </h1>
      <p className="text-sm font-medium text-slate-500">
        Track your progress, optimize your resume, and ace your next interview.
      </p>

      <div className="flex flex-wrap items-center gap-3 mt-1">
        {/* Target Role Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
          <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] shadow-sm">
            🎯
          </span>
          <span className="text-xs font-semibold text-slate-600">Target Role:</span>
          <span className="text-xs font-bold text-indigo-700">Full-Stack Developer</span>
        </div>

        {/* Active Resume Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
          <FileIcon />
          <span className="text-xs font-semibold text-slate-600">Active Resume:</span>
          <span className="text-xs font-bold text-emerald-700 underline decoration-emerald-300 underline-offset-2 cursor-pointer">
            Resume_v2.pdf
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-1" />
        </div>
      </div>
    </div>
  );
}

function FileIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
