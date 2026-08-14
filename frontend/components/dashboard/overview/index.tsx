"use client";

import { MetricCards } from "./metric-cards";
import { PrimaryWorkflows } from "./workflows";
import { ActiveSuggestions } from "./active-suggestions";
import { InsightsColumn } from "./insights";

interface InterviewRecord {
  id: string;
  score: number;
  jobRole: string | null;
  createdAt: string;
}

interface DashboardOverviewProps {
  userName?: string;
  stats?: {
    totalDrafts?: number;
    avgATSScore?: number;
    totalInterviews?: number;
  } | null;
  atsHistory?: InterviewRecord[];
}

export function DashboardOverview({
  userName,
  stats,
  atsHistory,
}: DashboardOverviewProps) {
  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      <MetricCards stats={stats} atsHistory={atsHistory} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <PrimaryWorkflows />
          <ActiveSuggestions />
        </div>

        <div className="xl:col-span-1 flex flex-col gap-6">
          <InsightsColumn interviewHistory={atsHistory} />
        </div>
      </div>
    </div>
  );
}
