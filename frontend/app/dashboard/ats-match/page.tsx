"use client";

import React from "react";
import { ATSSidebar } from "@/components/dashboard/ATS-Sidebar";

export default function ATSMatchPage() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Job Description Matching Engine
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Upload your resume and paste a job description to instantly see your match score, missing skills, and get actionable suggestions.
        </p>
      </div>

      {/* Main Component */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden min-h-[600px] shadow-sm">
        <ATSSidebar />
      </div>
    </div>
  );
}
