'use client';

import { Rocket, Target, ShieldCheck, Mic } from 'lucide-react';

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Overall Readiness Score */}
      <MetricCard 
        title="Overall Readiness Score"
        value="82%"
        status="On Track"
        statusColor="bg-emerald-100 text-emerald-700"
        ringColor="text-indigo-600"
        progress={82}
        icon={<Rocket className="w-5 h-5 text-indigo-600" />}
      />

      {/* Latest JD Match */}
      <MetricCard 
        title="Latest JD Match"
        value="74%"
        status="Needs Attention"
        statusColor="bg-amber-100 text-amber-700"
        subtext="Missing 3 Skills >"
        ringColor="text-amber-500"
        progress={74}
        icon={<Target className="w-5 h-5 text-amber-500" />}
      />

      {/* ATS Pass Rating */}
      <MetricCard 
        title="ATS Pass Rating"
        value={<span className="flex items-baseline gap-1">88<span className="text-sm text-slate-400 font-medium">/100</span></span>}
        status="Format Passed"
        statusColor="bg-emerald-100 text-emerald-700"
        ringColor="text-emerald-500"
        progress={88}
        icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
      />

      {/* Mock Interview Stats */}
      <MetricCard 
        title="Mock Interview Stats"
        value="5"
        status="+2 this week"
        statusColor="bg-purple-100 text-purple-700"
        subtext="Sessions Completed"
        ringColor="text-purple-500"
        progress={100}
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
  const strokeDashoffset = circumference - (progress / 100) * circumference;

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
