'use client';

import { Rocket, Target, ShieldCheck, Mic } from 'lucide-react';

export function MetricCards({ stats, atsHistory }: { stats?: any; atsHistory?: any[] }) {
  
  // Example wiring for stats:
  // If stats.avgATSScore exists, use it, else default to 0
  const avgAtsScore = stats?.avgATSScore || 0;
  
  // Since the backend doesn't provide JD match or Interview stats yet, we'll
  // safely fallback or compute simple values.
  const readinessScore = Math.min(100, Math.round(avgAtsScore * 0.8 + 20)); // Dummy derivation for readiness
  const totalDrafts = stats?.totalDrafts || 0;
  const mockSessions = 0; // Backend doesn't support this yet

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Overall Readiness Score */}
      <MetricCard 
        title="Overall Readiness Score"
        value={`${readinessScore}%`}
        status={readinessScore >= 80 ? "On Track" : readinessScore >= 50 ? "Needs Attention" : "Action Needed"}
        statusColor={readinessScore >= 80 ? "bg-emerald-100 text-emerald-700" : readinessScore >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}
        ringColor="text-indigo-600"
        progress={readinessScore}
        icon={<Rocket className="w-5 h-5 text-indigo-600" />}
      />

      {/* Latest JD Match (Fallback to Total Drafts since JD isn't on backend) */}
      <MetricCard 
        title="Total Resumes Created"
        value={totalDrafts.toString()}
        status={totalDrafts > 0 ? "Active Builder" : "No Drafts Yet"}
        statusColor="bg-amber-100 text-amber-700"
        subtext="Manage your drafts >"
        ringColor="text-amber-500"
        progress={totalDrafts > 0 ? 100 : 0}
        icon={<Target className="w-5 h-5 text-amber-500" />}
      />

      {/* ATS Pass Rating */}
      <MetricCard 
        title="Avg ATS Rating"
        value={<span className="flex items-baseline gap-1">{avgAtsScore}<span className="text-sm text-slate-400 font-medium">/100</span></span>}
        status={avgAtsScore >= 75 ? "Format Passed" : "Needs Review"}
        statusColor={avgAtsScore >= 75 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}
        ringColor="text-emerald-500"
        progress={avgAtsScore}
        icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
      />

      {/* Mock Interview Stats */}
      <MetricCard 
        title="Mock Interview Stats"
        value={mockSessions.toString()}
        status="Available Soon"
        statusColor="bg-purple-100 text-purple-700"
        subtext="Sessions Completed"
        ringColor="text-purple-500"
        progress={0}
        icon={<Mic className="w-5 h-5 text-purple-500" />}
      />
    </div>
  );
}

function MetricCard({ 
  title, value, status, statusColor, subtext, ringColor, progress, icon 
}: { 
  title: string; value: React.ReactNode; status: string; statusColor: string; subtext?: string; ringColor: string; progress: number; icon: React.ReactNode;
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
          {subtext && (
            <p className="text-xs font-semibold text-slate-500 mt-2 hover:text-indigo-600 cursor-pointer transition-colors">
              {subtext}
            </p>
          )}
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
