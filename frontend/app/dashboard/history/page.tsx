"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Loader2,
  FileText,
  Calendar,
  Target,
  Mic,
  FileSignature,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

type Tab = "ats" | "mock" | "resume";

interface ATSHistory {
  _id?: string;
  id?: string;
  score: number;
  jobRole: string | null;
  createdAt: string;
  matchedSkills?: string[];
  missingSkills?: string[];
}

interface MockHistory {
  _id: string;
  overallScore: number;
  jobRole: string;
  createdAt: string;
  overallFeedback?: string;
  answers?: any[];
}

interface ResumeHistory {
  _id: string;
  title: string;
  theme: string;
  createdAt: string;
  data?: Record<string, any>;
}

export default function HistoryPage() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("resume");
  const [selectedRecord, setSelectedRecord] = useState<{
    type: Tab;
    data: any;
  } | null>(null);

  const [atsHistory, setAtsHistory] = useState<ATSHistory[]>([]);
  const [mockHistory, setMockHistory] = useState<MockHistory[]>([]);
  const [resumeHistory, setResumeHistory] = useState<ResumeHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      // Parallel fetch with cache-busting to ensure fresh history
      const [atsRes, mockRes, resumeRes] = await Promise.all([
        fetch(`${baseUrl}/ats/history`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }).catch(() => null),
        fetch(`${baseUrl}/interview/history`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }).catch(() => null),
        fetch(`${baseUrl}/resume-builder/list`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }).catch(() => null),
      ]);

      if (atsRes && atsRes.ok) {
        const json = await atsRes.json();
        if (json.data) setAtsHistory(json.data);
      }
      if (mockRes && mockRes.ok) {
        const json = await mockRes.json();
        if (json.data) setMockHistory(json.data);
      }
      if (resumeRes && resumeRes.ok) {
        const json = await resumeRes.json();
        if (json.data) setResumeHistory(json.data);
      }
    } catch (err) {
      console.warn("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const tabs = [
    { id: "resume", label: "Resume Builder History", icon: FileSignature },
    { id: "mock", label: "Mock Interviews", icon: Mic },
    { id: "ats", label: "ATS Match History", icon: Target },
  ];

  const renderTabs = () => (
    <div className="flex space-x-8 border-b border-slate-200 mb-8 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`relative flex items-center gap-2 pb-4 text-sm font-bold transition-colors whitespace-nowrap ${
              isActive
                ? "text-indigo-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );

  const renderEmptyState = (title: string, subtitle: string, link: string) => (
    <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
      <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-2 mb-6">{subtitle}</p>
      <a
        href={link}
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors"
      >
        Get Started
      </a>
    </div>
  );

  const renderResumeHistory = () => {
    if (resumeHistory.length === 0) {
      return renderEmptyState(
        "No resume drafts yet",
        "Build your first resume using our AI tools to track progress.",
        "/dashboard/ai-resume-builder",
      );
    }
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                Theme
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {resumeHistory.map((record) => (
              <tr
                key={record._id}
                className="hover:bg-indigo-50/50 cursor-pointer transition-colors"
                onClick={() =>
                  setSelectedRecord({ type: "resume", data: record })
                }
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {format(new Date(record.createdAt), "MMM d, yyyy")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-slate-800">
                    {record.title}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg uppercase">
                    {record.theme}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMockHistory = () => {
    if (mockHistory.length === 0) {
      return renderEmptyState(
        "No mock interviews yet",
        "Take a mock interview to start tracking your performance.",
        "/dashboard/mock-interview",
      );
    }
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
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
                Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockHistory.map((record) => (
              <tr
                key={record._id}
                className="hover:bg-indigo-50/50 cursor-pointer transition-colors"
                onClick={() =>
                  setSelectedRecord({ type: "mock", data: record })
                }
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {format(new Date(record.createdAt), "MMM d, yyyy")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-slate-800">
                    {record.jobRole || "General"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="inline-flex items-center justify-end gap-2">
                    <span className="text-sm font-bold text-indigo-700">
                      {record.overallScore}%
                    </span>
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${record.overallScore}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderATSHistory = () => {
    if (atsHistory.length === 0) {
      return renderEmptyState(
        "No ATS matches yet",
        "Analyze your resume against a job description.",
        "/dashboard/ats-match",
      );
    }
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
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
            {atsHistory.map((record) => (
              <tr
                key={record._id || record.id}
                className="hover:bg-indigo-50/50 cursor-pointer transition-colors"
                onClick={() => setSelectedRecord({ type: "ats", data: record })}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {format(new Date(record.createdAt), "MMM d, yyyy")}
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
    );
  };

  const renderModal = () => {
    if (!selectedRecord) return null;
    const { type, data } = selectedRecord;

    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-900">
              {type === "ats" && "ATS Match Report"}
              {type === "mock" && "Mock Interview Feedback"}
              {type === "resume" && "Resume Draft Details"}
            </h2>
            <button
              onClick={() => setSelectedRecord(null)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/50 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {type === "ats" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                  <div>
                    <h3 className="font-bold text-indigo-900">
                      {data.jobRole || "General Analysis"}
                    </h3>
                    <p className="text-sm text-indigo-600 mt-1">
                      {format(new Date(data.createdAt), "MMMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-3xl font-black text-indigo-700">
                      {data.score}%
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                      Match Score
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                    <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5" /> Matched Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.matchedSkills?.length > 0 ? (
                        data.matchedSkills.map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-white text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 shadow-sm"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-emerald-600">
                          None detected
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100">
                    <h4 className="font-bold text-rose-800 flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5" /> Missing Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.missingSkills?.length > 0 ? (
                        data.missingSkills.map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-white text-rose-700 text-xs font-bold rounded-lg border border-rose-200 shadow-sm"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-rose-600">None detected</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {type === "mock" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-purple-50 rounded-2xl p-6 border border-purple-100">
                  <div>
                    <h3 className="font-bold text-purple-900">
                      {data.jobRole || "Mock Interview"}
                    </h3>
                    <p className="text-sm text-purple-600 mt-1">
                      {format(new Date(data.createdAt), "MMMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-3xl font-black text-purple-700">
                      {data.overallScore || 0}%
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-500">
                      Overall Score
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <h4 className="font-bold text-slate-800 mb-2">
                    Overall Feedback
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {data.overallFeedback || "No feedback available."}
                  </p>
                </div>

                {data.answers && data.answers.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">
                      Questions & Answers
                    </h4>
                    <div className="space-y-4">
                      {data.answers.map((ans: any, i: number) => (
                        <div
                          key={i}
                          className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                        >
                          <p className="text-xs font-bold text-slate-400 mb-1">
                            Question {i + 1}
                          </p>
                          <p className="text-sm font-semibold text-slate-800 mb-3">
                            {ans.questionText || "Question text not available"}
                          </p>
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-3">
                            <p className="text-xs font-bold text-slate-500 mb-1">
                              Your Answer:
                            </p>
                            <p className="text-sm text-slate-600 italic">
                              "
                              {ans.transcribedText ||
                                ans.userAnswer ||
                                "No answer recorded"}
                              "
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                              Score: {ans.contentScore}/100
                            </span>
                            {ans.feedback && (
                              <p className="text-xs text-slate-500 flex-1 truncate">
                                {ans.feedback}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {type === "resume" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <div>
                    <h3 className="font-bold text-blue-900">{data.title}</h3>
                    <p className="text-sm text-blue-600 mt-1">
                      {format(new Date(data.createdAt), "MMMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-black text-blue-700 uppercase">
                      {data.theme}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
                      Theme
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <h4 className="font-bold text-slate-800 mb-2">
                    Resume Data Overview
                  </h4>
                  <p className="text-sm text-slate-500 mb-4">
                    You can load this draft directly in the AI Resume Builder to
                    continue editing or exporting it.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                      <p className="text-xs font-bold text-slate-400">Name</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {data.data?.personalInfo?.fullName || 
                         (data.data?.personalInfo?.firstName ? `${data.data.personalInfo.firstName} ${data.data.personalInfo.lastName || ""}` : "N/A")}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                      <p className="text-xs font-bold text-slate-400">Email</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {data.data?.personalInfo?.email || "N/A"}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                      <p className="text-xs font-bold text-slate-400">
                        Experience
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {data.data?.experience?.length || 0} entries
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                      <p className="text-xs font-bold text-slate-400">
                        Education
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {data.data?.education?.length || 0} entries
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <a
                    href={`/dashboard/ai-resume-builder`}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                  >
                    Open in Builder
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Your Progress History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your past resumes, mock interviews, and ATS match analyses.
        </p>
      </div>

      {renderTabs()}

      {activeTab === "resume" && renderResumeHistory()}
      {activeTab === "mock" && renderMockHistory()}
      {activeTab === "ats" && renderATSHistory()}

      {renderModal()}
    </div>
  );
}
