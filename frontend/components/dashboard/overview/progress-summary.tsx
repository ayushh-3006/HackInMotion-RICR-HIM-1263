"use client";

import React, { useMemo } from "react";
import { Activity, Target, Mic, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";

interface ProgressSummaryProps {
  stats?: any;
  atsHistory?: any[];
  interviewsHistory?: any[];
}

export function ProgressSummary({
  stats,
  atsHistory = [],
  interviewsHistory = [],
}: ProgressSummaryProps) {
  // Sort and grab latest data safely
  const latestAts = useMemo(() => {
    if (!atsHistory.length) return null;
    return [...atsHistory].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [atsHistory]);

  const latestInterview = useMemo(() => {
    if (!interviewsHistory.length) return null;
    return [...interviewsHistory].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [interviewsHistory]);

  const totalActivity = atsHistory.length + interviewsHistory.length;

  // Render empty state if no data available
  if (totalActivity === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[220px]">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-slate-300" />
        </div>
        <h4 className="text-slate-900 font-bold mb-1">No Activity Yet</h4>
        <p className="text-slate-500 text-sm max-w-[200px]">
          Start building resumes or practicing interviews.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            Progress Summary
          </h3>
          <p className="text-sm text-slate-500 mt-1">Your overall engagement</p>
        </div>
        <div className="bg-emerald-50 p-2.5 rounded-xl">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Total Activity */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Total Activity</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Scans & Interviews</p>
            </div>
          </div>
          <span className="text-lg font-black text-slate-900">{totalActivity}</span>
        </div>

        {/* Latest ATS Score */}
        {latestAts && (
          <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border border-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                <Target className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Latest ATS Score</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {format(parseISO(latestAts.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <span className="text-lg font-black text-indigo-700">{latestAts.score}%</span>
          </div>
        )}

        {/* Latest Interview */}
        {latestInterview && (
          <div className="bg-purple-50/50 border border-purple-100/50 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border border-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                <Mic className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Last Interview</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {format(parseISO(latestInterview.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <span className="text-lg font-black text-purple-700">
              {latestInterview.overallScore || 0}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
