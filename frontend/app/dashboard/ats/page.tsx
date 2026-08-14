"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Sparkles, BarChart2 } from "lucide-react";

import ResumeUpload from "@/components/ats/ResumeUpload";
import JobDetailsForm from "@/components/ats/JobDetailsForm";
import ScoreGauge from "@/components/ats/ScoreGauge";
import SkillTagList from "@/components/ats/SkillTagList";
import SuggestionsList from "@/components/ats/SuggestionsList";
import SectionScores from "@/components/ats/SectionScores";

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

export default function ATSCheckerPage() {
  const { getToken } = useAuth();

  /* Form state */
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState("");
  const [jobSkills, setJobSkills] = useState("");
  const [experience, setExperience] = useState("Fresher");

  /* UI state */
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please upload your resume to continue.");
      return;
    }
    if (!jobRole.trim() && !jobSkills.trim()) {
      toast.error("Please provide either a Job Role or a Job Description.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const token = await getToken();
      if (!token) {
        toast.error("Not authenticated. Please sign in.");
        setLoading(false);
        return;
      }

      const fd = new FormData();
      fd.append("resumeFile", file);
      fd.append("jobRole", jobRole);
      fd.append("jobSkills", jobSkills);
      fd.append("experience", experience);

      const base =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const res = await fetch(`${base}/ats/calculate-file`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setResult(data);
      toast.success("Resume analyzed successfully!");
    } catch (err: any) {
      toast.error(
        err.message || "We couldn't complete the analysis. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-6 mb-6">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <BarChart2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Resume Analysis
            <span className="bg-indigo-50 text-indigo-600 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold ml-2">
              ATS Score Checker
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium max-w-2xl">
            See how well your resume matches your target role and get actionable
            AI-powered suggestions.
          </p>
        </div>
      </div>

      {/* ── Input Section ── */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <ResumeUpload file={file} setFile={setFile} disabled={loading} />

        <JobDetailsForm
          jobRole={jobRole}
          setJobRole={setJobRole}
          experience={experience}
          setExperience={setExperience}
          jobSkills={jobSkills}
          setJobSkills={setJobSkills}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </form>

      {/* ── Loading Overlay (Optional, the button handles it already) ── */}
      {loading && !result && (
        <div className="mt-8 p-12 bg-indigo-50 border border-indigo-100 rounded-3xl flex flex-col items-center justify-center text-center animate-pulse">
          <Sparkles className="w-8 h-8 text-indigo-400 mb-3" />
          <h3 className="text-lg font-bold text-indigo-900">
            Analyzing your resume...
          </h3>
          <p className="text-sm text-indigo-700/70 mt-1 font-medium">
            Comparing your skills with the job description
          </p>
        </div>
      )}

      {/* ── Analysis Results ── */}
      {result && !loading && (
        <div className="space-y-6 pt-8 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900">
              Analysis Results
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Review your match score and personalized recommendations.
            </p>
          </div>

          {/* Score + Section Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ScoreGauge score={result.score} />
            </div>
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">
                AI Summary
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed font-medium mb-8">
                {result.aiSummary}
              </p>

              <div className="mt-auto">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4">
                  Match Breakdown
                </h4>
                <SectionScores scores={result.sectionScores} />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkillTagList
              title="Matched Skills"
              skills={result.matchedSkills}
              type="matched"
            />
            <SkillTagList
              title="Missing / Weak Skills"
              skills={result.missingSkills}
              type="missing"
            />
          </div>

          {/* Suggestions */}
          <SuggestionsList suggestions={result.suggestions} />
        </div>
      )}
    </div>
  );
}
