"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, UploadCloud, AlertCircle } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is used based on typical modern Next.js setups

interface ATSResult {
  matchScore: number;
  missingSkills: string[];
  actionableSuggestions: string[];
}

export function ATSSidebar() {
  const { getToken } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit");
        return;
      }
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleMatch = async () => {
    if (!file) {
      toast.error("Please upload a resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please provide a job description.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = await getToken();
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const response = await fetch(`${API_URL}/ats/match`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process ATS match");
      }

      setResult(data.data);
      toast.success("ATS Analysis Complete!");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white border-l border-slate-200 p-6 overflow-y-auto">
      <h2 className="text-xl font-bold mb-6 text-slate-900">
        ATS Matching Engine
      </h2>

      {/* Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Upload Resume (PDF/DOCX)
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-300 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-8 h-8 mb-3 text-slate-400" />
              <p className="mb-2 text-sm text-slate-600">
                <span className="font-semibold text-indigo-600">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-slate-500">
                {file ? file.name : "Max 5MB"}
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      {/* Job Description Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Job Description
        </label>
        <textarea
          className="w-full h-40 p-4 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white border-slate-200 text-slate-900 resize-none shadow-sm placeholder:text-slate-400"
          placeholder="Paste the target job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      <button
        onClick={handleMatch}
        disabled={loading || !file || !jobDescription}
        className="w-full py-3 px-4 flex items-center justify-center text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-8 shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          "Match to Job"
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm mt-4">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-slate-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={351.858}
                  strokeDashoffset={
                    351.858 - (351.858 * result.matchScore) / 100
                  }
                  className={`${
                    result.matchScore >= 80
                      ? "text-emerald-500"
                      : result.matchScore >= 60
                        ? "text-amber-500"
                        : "text-rose-500"
                  } transition-all duration-1000 ease-out`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {result.matchScore}%
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Match
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Missing Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.missingSkills.length > 0 ? (
                result.missingSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-700 rounded-full border border-rose-200 shadow-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                  No major missing skills found! Excellent.
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Actionable Suggestions
            </h3>
            <ul className="space-y-3">
              {result.actionableSuggestions.length > 0 ? (
                result.actionableSuggestions.map((suggestion, i) => (
                  <li
                    key={i}
                    className="text-sm font-medium text-slate-700 flex items-start bg-white p-3 rounded-xl border border-slate-200 shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-3 shrink-0"></span>
                    <span className="leading-relaxed">{suggestion}</span>
                  </li>
                ))
              ) : (
                <p className="text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                  Your resume looks highly aligned to the role!
                </p>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
