'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function PrimaryWorkflows({ interviewHistory }: { interviewHistory?: any[] }) {
  
  const chartData = useMemo(() => {
    if (!interviewHistory || interviewHistory.length === 0) return [];
    
    // Process interview history into format for recharts
    return interviewHistory.map((item, index) => {
      const date = new Date(item.createdAt);
      return {
        name: `Session ${index + 1}`,
        date: date.toLocaleDateString(),
        score: item.score || 0,
        role: item.jobRole || 'Unknown'
      };
    });
  }, [interviewHistory]);

  return (
    <div className="flex flex-col w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Interview Performance History</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Track your mock interview scores over time.
        </p>
      </div>
      
      {chartData.length > 0 ? (
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: -20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#0F172A', marginBottom: '4px' }}
                formatter={(value: number, name: string, props: any) => [`${value} / 100`, props.payload.role]}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#6366F1" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, fill: '#6366F1' }}
                name="Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="w-full h-[300px] flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm font-medium text-slate-500">No interview history yet.</p>
          <p className="text-xs text-slate-400 mt-1">Complete a mock interview to see your progress.</p>
        </div>
      )}
    </div>
  );
}
