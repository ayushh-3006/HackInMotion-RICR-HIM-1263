"use client";

import React from "react";
import Link from "next/link";
import { Mic, ArrowRight, Calendar, CheckCircle2, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

interface RecentInterviewsProps {
  interviewsHistory?: any[];
}

export function RecentInterviews({
  interviewsHistory = [],
}: RecentInterviewsProps) {
  // Sort chronologically descending and take top 5
  const recentInterviews = [...interviewsHistory]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const hasData = recentInterviews.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">
            Recent Mock Interviews
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Your latest practice sessions
          </p>
        </div>
        <Link
          href="/dashboard/mock-interview"
          className="flex items-center gap-1.5 text-sm font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors"
        >
          Start Interview <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col">
        {hasData ? (
          <div className="space-y-3">
            {recentInterviews.map((interview) => {
              const score = interview.overallScore || 0;
              const isCompleted = interview.status === "completed";
              const isGood = score >= 75;
              const isAvg = score >= 50 && score < 75;

              return (
                <div
                  key={interview.id || interview._id}
                  className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white border border-slate-200 shadow-sm rounded-xl flex items-center justify-center text-slate-400 group-hover:text-purple-500 transition-colors">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        {interview.jobRole || "General Interview"}
                      </p>
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(parseISO(interview.createdAt), "MMM d, yyyy")}
                        </span>
                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Clock className="w-3.5 h-3.5" />
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isCompleted && (
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full ${
                            isGood
                              ? "bg-purple-500"
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
                            ? "bg-purple-100 text-purple-700"
                            : isAvg
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {score}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Mic className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-slate-900 font-bold mb-1">No Interviews Yet</h4>
            <p className="text-slate-500 text-sm max-w-[200px]">
              Start an AI mock interview to track your performance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
