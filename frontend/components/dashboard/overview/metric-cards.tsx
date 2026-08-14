'use client';

import { Target, ShieldCheck, Mic } from 'lucide-react';
import Link from 'next/link';

export function MetricCards({ stats }: { stats?: any }) {
  
  const avgInterviewScore = stats?.avgInterviewScore || 0;
  const totalDrafts = stats?.totalDrafts || 0;
  const totalInterviews = stats?.totalInterviews || 0;

  const getAtsColor = (score: number) => {
    if (score >= 80) return "bg-emerald-100 text-emerald-700";
    if (score >= 60) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  const getAtsStatus = (score: number) => {
    if (score >= 80) return "Format Passed";
    if (score >= 60) return "Needs Review";
    return "Action Needed";
  };

  const getAtsRing = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Total Resumes Created */}
      <MetricCard 
        title="Total Resumes Created"
        value={totalDrafts.toString()}
        status={totalDrafts > 0 ? `${totalDrafts} Drafts Saved` : "No Drafts Yet"}
        statusColor="bg-blue-100 text-blue-700"
        subtext={
          <Link href="/dashboard/resumes" className="text-xs font-semibold text-slate-500 mt-2 hover:text-indigo-600 cursor-pointer transition-colors block">
            Manage your drafts &gt;
          </Link>
        }
        ringColor="text-blue-500"
        progress={totalDrafts > 0 ? Math.min(totalDrafts * 20, 100) : 0}
        icon={<Target className="w-5 h-5 text-blue-500" />}
      />

      {/* Avg Interview Rating */}
      <MetricCard 
        title="Avg Interview Score"
        value={<span className="flex items-baseline gap-1">{avgInterviewScore}<span className="text-sm text-slate-400 font-medium">/100</span></span>}
        status={getAtsStatus(avgInterviewScore)}
        statusColor={getAtsColor(avgInterviewScore)}
        ringColor={getAtsRing(avgInterviewScore)}
        progress={avgInterviewScore}
        icon={<ShieldCheck className={`w-5 h-5 ${getAtsRing(avgInterviewScore)}`} />}
      />

      {/* Mock Interview Stats */}
      <MetricCard 
        title="Mock Interview Stats"
        value={totalInterviews.toString()}
        status={totalInterviews > 0 ? "Active Practice" : "Not Started"}
        statusColor={totalInterviews > 0 ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"}
        subtext={<span className="text-xs font-semibold text-slate-500 mt-2 block">Sessions Completed</span>}
        ringColor="text-purple-500"
        progress={totalInterviews > 0 ? Math.min(totalInterviews * 25, 100) : 0}
        icon={<Mic className="w-5 h-5 text-purple-500" />}
      />
    </div>
  );
}

function MetricCard({ 
  title, value, status, statusColor, subtext, ringColor, progress, icon 
}: { 
  title: string; value: React.ReactNode; status: string; statusColor: string; subtext?: React.ReactNode; ringColor: string; progress: number; icon: React.ReactNode;
}) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((progress || 0) / 100) * circumference;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <h3 className="text-sm font-semibold text-slate-600 mb-3">{title}</h3>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold text-slate-900 mb-2">{value}</div>
          <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${statusColor}`}>
            {status}
          </div>
          {subtext}
        </div>

        {/* Circular Chart */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-slate-100 stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
            ></circle>
            <circle
              className={`${ringColor} stroke-current transition-all duration-1000 ease-in-out`}
              strokeWidth="8"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            ></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center shadow-sm rounded-full w-12 h-12 m-auto bg-white border border-slate-100 group-hover:scale-110 transition-transform">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
