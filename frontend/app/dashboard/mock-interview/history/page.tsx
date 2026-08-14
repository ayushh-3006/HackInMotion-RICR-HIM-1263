'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import {
  History, Loader2, ChevronDown, ChevronUp, ArrowLeft,
  Award, Clock, Mic, Target, Zap, AlertTriangle, TrendingUp, Calendar
} from 'lucide-react';

interface FillerWord { word: string; count: number; }

interface Answer {
  questionId: string;
  transcribedText: string;
  contentScore: number;
  toneScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  wpm: number;
  fillerWords: FillerWord[];
  confidenceLabel: string;
  idealAnswer: string;
  audioDurationSeconds: number;
}

interface Session {
  _id: string;
  jobRole: string;
  interviewType: string;
  category: string;
  difficulty: string;
  questions: { id: string; text: string }[];
  answers: Answer[];
  overallScore: number;
  overallFeedback: string;
  status: string;
  createdAt: string;
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

function getDifficultyColor(d: string) {
  if (d === 'Easy') return 'text-emerald-600 bg-emerald-50';
  if (d === 'Hard') return 'text-red-600 bg-red-50';
  return 'text-amber-600 bg-amber-50';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function InterviewHistoryPage() {
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/interview/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSessions(data.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch interview history');
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
          <p className="text-sm text-slate-500 font-medium">Loading interview history…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <a
            href="/dashboard/mock-interview"
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-indigo-500" />
              Interview History
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {sessions.length} past session{sessions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <a
          href="/dashboard/mock-interview"
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-bold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm flex items-center gap-2"
        >
          <Mic className="w-4 h-4" />
          New Interview
        </a>
      </div>

      {/* Empty State */}
      {sessions.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">No interviews yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Start your first mock interview to receive AI-powered feedback on your answers.
          </p>
          <a
            href="/dashboard/mock-interview"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
          >
            Start Practice
          </a>
        </div>
      )}

      {/* Session Cards */}
      <div className="space-y-4">
        {sessions.map(session => {
          const isExpanded = expandedSession === session._id;
          const avgWpm = session.answers.length > 0
            ? Math.round(session.answers.reduce((s, a) => s + (a.wpm || 0), 0) / session.answers.length)
            : 0;
          const totalFillers = session.answers.reduce((s, a) =>
            s + (a.fillerWords || []).reduce((fs, f) => fs + f.count, 0), 0
          );

          return (
            <div key={session._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
              {/* Summary Row */}
              <button
                onClick={() => setExpandedSession(isExpanded ? null : session._id)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Score Badge */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center border shrink-0 ${getScoreColor(session.overallScore)}`}>
                    <span className="text-xl font-black">{session.overallScore}</span>
                  </div>
                  {/* Info */}
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{session.jobRole}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">{session.category}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getDifficultyColor(session.difficulty)}`}>{session.difficulty}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${session.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {session.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  {/* Quick Stats */}
                  <div className="hidden md:flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {session.answers.length}/{session.questions.length} Qs</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {avgWpm} WPM</span>
                  </div>
                  {/* Date */}
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-slate-600">{formatDate(session.createdAt)}</p>
                    <p className="text-[10px] text-slate-400">{formatTime(session.createdAt)}</p>
                  </div>
                  {/* Chevron */}
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-slate-100 px-6 py-5 bg-slate-50/30 animate-in fade-in duration-300">
                  {/* Delivery Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg WPM</p>
                      <p className={`text-xl font-black ${avgWpm >= 130 && avgWpm <= 160 ? 'text-emerald-600' : 'text-amber-500'}`}>{avgWpm}</p>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fillers</p>
                      <p className={`text-xl font-black ${totalFillers <= 4 ? 'text-emerald-600' : totalFillers <= 8 ? 'text-amber-500' : 'text-red-500'}`}>{totalFillers}</p>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Score</p>
                      <p className={`text-xl font-black ${session.overallScore >= 80 ? 'text-emerald-600' : session.overallScore >= 60 ? 'text-blue-500' : 'text-amber-500'}`}>{session.overallScore}/100</p>
                    </div>
                  </div>

                  {/* Per-Question Details */}
                  <div className="space-y-4">
                    {session.answers.map((ans, idx) => {
                      const q = session.questions.find(sq => sq.id === ans.questionId);
                      return (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-slate-800 mb-2">
                            <span className="text-indigo-500">Q{idx + 1}.</span> {q?.text}
                          </h4>
                          <p className="text-xs text-slate-500 italic mb-3 line-clamp-2">"{ans.transcribedText}"</p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${getScoreColor(ans.contentScore)}`}>Content: {ans.contentScore}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${getScoreColor(ans.toneScore)}`}>Delivery: {ans.toneScore}</span>
                            <span className="text-xs font-bold px-2 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-200">{ans.wpm || 0} WPM</span>
                            {ans.confidenceLabel && (
                              <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                                ans.confidenceLabel === 'Confident' ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : ans.confidenceLabel === 'Hesitant' ? 'bg-amber-50 text-amber-600 border-amber-200'
                                : ans.confidenceLabel === 'Fast-Paced' ? 'bg-red-50 text-red-600 border-red-200'
                                : 'bg-blue-50 text-blue-600 border-blue-200'
                              }`}>
                                {ans.confidenceLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
