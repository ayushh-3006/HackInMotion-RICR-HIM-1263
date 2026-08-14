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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-6 overflow-y-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
        ATS Matching Engine
      </h2>

      {/* Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload Resume (PDF/DOCX)
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Job Description
        </label>
        <textarea
          className="w-full h-40 p-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white resize-none"
          placeholder="Paste the target job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      <button
        onClick={handleMatch}
        disabled={loading || !file || !jobDescription}
        className="w-full py-3 px-4 flex items-center justify-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-8"
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
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={351.858}
                  strokeDashoffset={351.858 - (351.858 * result.matchScore) / 100}
                  className={`${
                    result.matchScore >= 80
                      ? "text-green-500"
                      : result.matchScore >= 60
                        ? "text-yellow-500"
                        : "text-red-500"
                  } transition-all duration-1000 ease-out`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {result.matchScore}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Match</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Missing Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.missingSkills.length > 0 ? (
                result.missingSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full border border-red-200 dark:border-red-800"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-green-600 dark:text-green-400">
                  No major missing skills found!
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Actionable Suggestions
            </h3>
            <ul className="space-y-3">
              {result.actionableSuggestions.length > 0 ? (
                result.actionableSuggestions.map((suggestion, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-600 dark:text-gray-300 flex items-start"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 shrink-0"></span>
                    <span>{suggestion}</span>
                  </li>
                ))
              ) : (
                <p className="text-sm text-green-600 dark:text-green-400">
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
