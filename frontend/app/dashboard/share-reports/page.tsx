'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Share2, Link as LinkIcon, ExternalLink, Copy, XCircle, Loader2, Clock, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface Session {
  _id: string;
  jobRole: string;
  category: string;
  difficulty: string;
  overallScore: number;
  isPublic: boolean;
  shareToken: string | null;
  sharedAt: string | null;
  createdAt: string;
}

export default function ShareReportsPage() {
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSharedSessions();
  }, []);

  const fetchSharedSessions = async () => {
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/interview/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Filter only public sessions
      const shared = data.data.filter((s: Session) => s.isPublic);
      setSessions(shared);
    } catch (error: any) {
      toast.error('Failed to load shared reports');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (sessionId: string) => {
    try {
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/interview/sessions/${sessionId}/share`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to revoke access');
      toast.success('Share link revoked');
      setSessions(prev => prev.filter(s => s._id !== sessionId));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const copyLink = (shareToken: string) => {
    const url = `${window.location.origin}/shared/reports/${shareToken}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <Share2 className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shared Reports</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Manage your public mock interview scorecards</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Globe className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Shared Reports</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
            You haven't shared any interview reports yet. Go to your Mock Interview history to share a report.
          </p>
          <a
            href="/dashboard/mock-interview/history"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
          >
            View Interview History
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sessions.map(session => (
            <div key={session._id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-lg">{session.jobRole}</h3>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    Public
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  {session.category} · {session.difficulty} · Score: <span className="font-bold text-slate-700">{session.overallScore}/100</span>
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                  <Clock className="w-3.5 h-3.5" />
                  Shared on {new Date(session.sharedAt || session.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => copyLink(session.shareToken!)}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
                <a
                  href={`/shared/reports/${session.shareToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Preview
                </a>
                <button
                  onClick={() => handleRevoke(session._id)}
                  className="p-2.5 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-600 rounded-xl transition-all shadow-sm"
                  title="Revoke Access"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
