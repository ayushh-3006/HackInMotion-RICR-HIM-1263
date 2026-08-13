'use client';

import { Lightbulb, Info, CheckCircle2, ChevronRight } from 'lucide-react';

export function ActiveSuggestions() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900">Active Optimization Suggestions</h3>
        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Suggestion 1 */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
              Add quantifiable impact in your experience section
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100" />
        </div>

        {/* Suggestion 2 */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
              Include these missing keywords: Docker, CI/CD, System Design
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100" />
        </div>

        {/* Suggestion 3 */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
              Improve your summary to highlight full-stack expertise
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
}
