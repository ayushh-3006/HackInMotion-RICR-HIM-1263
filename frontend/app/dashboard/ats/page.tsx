'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { UploadCloud, FileText, Loader2, Briefcase, FileSearch, X, Sparkles } from 'lucide-react';
import ScoreGauge from '@/components/ats/ScoreGauge';
import SkillTagList from '@/components/ats/SkillTagList';
import SuggestionsList from '@/components/ats/SuggestionsList';
import SectionScores from '@/components/ats/SectionScores';

/* ──────── Types ──────── */
interface ATSResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  keywordDensity: Record<string, number>;
  sectionScores: Record<string, number>;
  aiSummary: string;
  atsCompatible: boolean;
}

/* ──────── Constants ──────── */
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/* ──────── Page ──────── */
export default function ATSCheckerPage() {
  const { getToken } = useAuth();

  /* Form state */
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState('');
  const [jobSkills, setJobSkills] = useState('');
  const [experience, setExperience] = useState('');

  /* UI state */
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── File validation helper ── */
  const validateAndSetFile = useCallback((f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      toast.error('Unsupported file type. Please upload a PDF or DOCX.');
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 5 MB.');
      return;
    }
    setFile(f);
  }, []);

  /* ── Drag & Drop handlers ── */
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = () => setDragActive(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) { toast.error('Please upload your resume.'); return; }
    if (!jobRole.trim() && !jobSkills.trim()) {
      toast.error('Provide a Job Role or Required Skills.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const token = await getToken();
      if (!token) { toast.error('Not authenticated. Please sign in.'); setLoading(false); return; }

      const fd = new FormData();
      fd.append('resumeFile', file);
      fd.append('jobRole', jobRole);
      fd.append('jobSkills', jobSkills);
      fd.append('experience', experience);

      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const res = await fetch(`${base}/ats/calculate-file`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      setResult(data);
      toast.success('Resume analyzed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  /* ──────── Render ──────── */
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-500" />
          ATS Score Checker
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Upload your resume, enter the target role and skills, and let our AI tell you exactly how to improve.
        </p>
      </div>

      {/* ── Form Card ── */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left — Dropzone */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Resume (PDF / DOCX)
            </label>
            <div
              className={`relative flex flex-col items-center justify-center w-full h-60 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-400 bg-indigo-50/60'
                  : file
                    ? 'border-indigo-300 bg-indigo-50/40'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/60'
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={onFileChange}
              />
              {file ? (
                <div className="flex flex-col items-center text-indigo-600">
                  <FileText size={40} className="mb-3 opacity-80" />
                  <p className="font-bold text-sm">{file.name}</p>
                  <p className="text-xs text-indigo-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="mt-3 text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                  >
                    <X size={14} /> Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <UploadCloud size={40} className="mb-3 opacity-60" />
                  <p className="font-bold text-sm text-slate-600">Click or drag to upload</p>
                  <p className="text-xs mt-1">PDF or DOCX · Max 5 MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Right — Inputs */}
          <div className="space-y-5 flex flex-col">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Job Role</label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Developer"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Experience Level</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 3–5 years"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Required Skills / Job Description</label>
              <textarea
                value={jobSkills}
                onChange={(e) => setJobSkills(e.target.value)}
                placeholder="Paste required skills or the full job description here…"
                className="flex-1 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow resize-none min-h-[100px] placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <FileSearch size={18} />
                  Run ATS Analysis
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ── Results ── */}
      {result && (
        <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Score + Section Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ScoreGauge score={result.score} />
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">AI Summary</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium mb-6">{result.aiSummary}</p>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Section Performance</h4>
              <SectionScores scores={result.sectionScores} />
            </div>
          </div>

          {/* Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkillTagList title="Matched Skills" skills={result.matchedSkills} type="matched" />
            <SkillTagList title="Missing Skills" skills={result.missingSkills} type="missing" />
          </div>

          {/* Suggestions */}
          <SuggestionsList suggestions={result.suggestions} />
        </div>
      )}
    </div>
  );
}
