"use client";

import React from "react";
import { Briefcase, Loader2, Sparkles } from "lucide-react";

interface JobDetailsFormProps {
  jobRole: string;
  setJobRole: (val: string) => void;
  experience: string;
  setExperience: (val: string) => void;
  jobSkills: string;
  setJobSkills: (val: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function JobDetailsForm({
  jobRole,
  setJobRole,
  experience,
  setExperience,
  jobSkills,
  setJobSkills,
  loading,
  onSubmit,
}: JobDetailsFormProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">
          Step 2: Target Job Details
        </h3>
        <p className="text-sm text-slate-500 font-medium">
          Tell us about the role so we can evaluate accurately.
        </p>
      </div>

      <div className="flex-1 flex flex-col space-y-5 bg-white border border-slate-200 shadow-sm rounded-3xl p-6 md:p-8">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Target Job Role
          </label>
          <div className="relative">
            <Briefcase
              size={16}
              className="absolute left-4 top-3.5 text-slate-400"
            />
            <select
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-shadow appearance-none disabled:opacity-60"
            >
              <option value="">Select a role...</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Product Manager">Product Manager</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="Mobile App Developer">Mobile App Developer</option>
              <option value="QA Automation Engineer">
                QA Automation Engineer
              </option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Experience Level
          </label>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-shadow appearance-none disabled:opacity-60"
          >
            <option value="Fresher">Fresher</option>
            <option value="1-3 years">1-3 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5-7 years">5-7 years</option>
            <option value="7-10 years">7-10 years</option>
          </select>
        </div>

        <div className="flex-1 flex flex-col">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Job Description / Required Skills
          </label>
          <div className="relative flex-1 flex flex-col">
            <textarea
              value={jobSkills}
              onChange={(e) => setJobSkills(e.target.value)}
              disabled={loading}
              placeholder="Paste the target job description here..."
              className="flex-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-shadow resize-none min-h-[140px] placeholder:text-slate-400 placeholder:font-normal disabled:opacity-60"
            />
            {jobSkills.length > 0 && (
              <div className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-slate-100">
                {jobSkills.length} chars
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="w-full py-3.5 px-6 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            <>
              <Sparkles size={18} className="text-indigo-200" />
              Analyze Resume
            </>
          )}
        </button>
      </div>
    </div>
  );
}
