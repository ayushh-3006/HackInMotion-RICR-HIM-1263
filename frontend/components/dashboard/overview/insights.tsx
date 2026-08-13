'use client';

import { ChevronDown, Check, AlertTriangle, X, Link as LinkIcon, Download } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const mockTrendData = [
  { date: 'May 15', score: 25 },
  { date: 'May 22', score: 45 },
  { date: 'May 29', score: 55 },
  { date: 'Jun 5', score: 75 },
  { date: 'Jun 12', score: 82 },
];

export function InsightsColumn() {
  return (
    <div className="flex flex-col w-full">
      {/* Invisible Title just to keep alignment perfectly synced with the left column's title */}
      <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight xl:invisible">
        Insights & Tracking
      </h2>

      <div className="flex flex-col gap-6">
        {/* Score Improvement Trend */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Score Improvement Trend</h3>
            <button className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
              Last 5 Uploads <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="h-40 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#6d28d9', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#6d28d9' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ATS Compatibility Checklist */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">ATS Compatibility Checklist</h3>
          <ul className="space-y-3">
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium text-slate-700">Standard Font & Layout Check</span>
              </div>
              <span className="text-xs font-bold text-emerald-600">Passed</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium text-slate-700">Section Heading Parsing</span>
              </div>
              <span className="text-xs font-bold text-emerald-600">Passed</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium text-slate-700">Bullet Points Readability</span>
              </div>
              <span className="text-xs font-bold text-amber-600">Warning</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <X className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium text-slate-700">Tables / Complex Column</span>
              </div>
              <span className="text-xs font-bold text-red-600">Issue</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <X className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium text-slate-700">Images / Icons Usage</span>
              </div>
              <span className="text-xs font-bold text-red-600">Issue</span>
            </li>
          </ul>
        </div>

        {/* Share Your Report */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-1">Share Your Report</h3>
          <p className="text-xs font-medium text-slate-500 mb-4">
            Get a shareable link or export PDF to share with mentors or recruiters.
          </p>
          <div className="flex items-center gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold transition-colors">
              <LinkIcon className="w-4 h-4" /> Copy Link
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm shadow-indigo-200 transition-colors">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
