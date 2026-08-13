'use client';


import { MetricCards } from './metric-cards';
import { PrimaryWorkflows } from './workflows';
import { ActiveSuggestions } from './active-suggestions';
import { InsightsColumn } from './insights';

export function DashboardOverview({ userName }: { userName?: string }) {
  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">

      <MetricCards />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <PrimaryWorkflows />
          <ActiveSuggestions />
        </div>
        
        <div className="xl:col-span-1 flex flex-col gap-6">
          <InsightsColumn />
        </div>
      </div>
    </div>
  );
}
