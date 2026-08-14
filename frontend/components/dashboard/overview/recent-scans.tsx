"use client";

import React from "react";
import Link from "next/link";
import { FileText, ArrowRight, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";

interface RecentScansProps {
  atsHistory?: any[];
}

export function RecentScans({ atsHistory = [] }: RecentScansProps) {
  // Sort chronologically descending and take top 5
  const recentScans = [...atsHistory]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const hasData = recentScans.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">
            Recent Resume Scans
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Your latest ATS analyses
          </p>
        </div>
        <Link
          href="/dashboard/ats"
          className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors"
        >
          Scan New <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col">
        {hasData ? (
          <div className="space-y-3">
            {recentScans.map((scan) => {
              const score = scan.score || 0;
              const isGood = score >= 75;
              const isAvg = score >= 50 && score < 75;

              return (
                <div
                  key={scan.id || scan._id}
                  className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white border border-slate-200 shadow-sm rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        {scan.jobRole || "General Analysis"}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(parseISO(scan.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className={`h-full rounded-full ${
                          isGood
                            ? "bg-emerald-500"
                            : isAvg
                              ? "bg-amber-500"
                              : "bg-rose-500"
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-black px-2.5 py-1 rounded-lg ${
                        isGood
                          ? "bg-emerald-100 text-emerald-700"
                          : isAvg
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {score}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-slate-900 font-bold mb-1">No Scans Yet</h4>
            <p className="text-slate-500 text-sm max-w-[200px]">
              Upload your resume and check its ATS compatibility.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
