"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";

interface ScoreTrendProps {
  atsHistory?: any[];
}

export function ScoreTrend({ atsHistory = [] }: ScoreTrendProps) {
  const chartData = useMemo(() => {
    if (!atsHistory || atsHistory.length === 0) return [];

    // Sort chronologically ascending
    const sorted = [...atsHistory].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return sorted.map((record) => ({
      date: format(parseISO(record.createdAt), "MMM d"),
      score: record.score,
    }));
  }, [atsHistory]);

  const hasData = chartData.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-full relative overflow-hidden group">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            Score Improvement Trend
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Last {hasData ? chartData.length : 5} Resume Uploads
          </p>
        </div>
        <div className="bg-indigo-50 p-2.5 rounded-xl">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
        </div>
      </div>

      <div className="flex-1 w-full min-h-[220px] relative">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "#4f46e5", fontWeight: "bold" }}
                labelStyle={{ color: "#64748b", marginBottom: "4px" }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorScore)"
                activeDot={{ r: 6, strokeWidth: 0, fill: "#4f46e5" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-slate-900 font-semibold mb-1">No Data Yet</h4>
            <p className="text-slate-500 text-sm max-w-[200px]">
              Analyze your first resume to start tracking ATS improvement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
