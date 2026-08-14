"use client";

import { MetricCards } from "./metric-cards";
import { ScoreTrend } from "./score-trend";
import { RecentScans } from "./recent-scans";
import { RecentInterviews } from "./recent-interviews";
import { ProgressSummary } from "./progress-summary";

interface DashboardOverviewProps {
  userName?: string;
  stats?: {
    totalDrafts?: number;
    avgATSScore?: number;
    totalInterviews?: number;
    avgInterviewScore?: number;
  } | null;
  atsHistory?: any[];
  interviewsHistory?: any[];
}

export function DashboardOverview({
  userName,
  stats,
  atsHistory,
  interviewsHistory,
}: DashboardOverviewProps) {
  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome back, {userName || "there"} 👋
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Here is what's happening with your job search prep.
        </p>
      </div>

      {/* Top Row: 4 Metric Cards */}
      <MetricCards atsHistory={atsHistory} interviewsHistory={interviewsHistory} />

      {/* Middle Row: Recent Scans (~66%) & Score Trend (~33%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <RecentScans atsHistory={atsHistory} />
        </div>
        <div className="lg:col-span-1">
          <ScoreTrend atsHistory={atsHistory} />
        </div>
      </div>

      {/* Bottom Row: Recent Interviews (~66%) & Progress Summary (~33%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <RecentInterviews interviewsHistory={interviewsHistory} />
        </div>
        <div className="lg:col-span-1">
          <ProgressSummary stats={stats} atsHistory={atsHistory} interviewsHistory={interviewsHistory} />
        </div>
      </div>
    </div>
  );
}
