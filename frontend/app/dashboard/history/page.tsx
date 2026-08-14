"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";

interface InterviewRecord {
  id: string;
  score: number;
  jobRole: string | null;
  createdAt: string;
}

export default function HistoryPage() {
  const { getToken } = useAuth();
  const [history, setHistory] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const res = await fetch(`${baseUrl}/ats/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setHistory(json.data);
        }
      } else {
        console.warn(`History fetch failed with status: ${res.status}.`);
      }
    } catch (err) {
      console.warn("History fetchData network error or backend unavailable.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">
            Loading your history…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Analysis History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your past resume analyses and mock interview progress.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            No progress data yet
          </h3>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            Analyze your first resume to start tracking progress.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Target Role
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                    Match Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {format(
                          new Date(record.createdAt),
                          "MMM d, yyyy h:mm a",
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-800">
                        {record.jobRole || "General Analysis"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <span className="text-sm font-bold text-indigo-700">
                          {record.score}%
                        </span>
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${record.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
