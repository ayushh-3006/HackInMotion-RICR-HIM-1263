"use client";

import React from "react";
import { ScanSearch } from "lucide-react";
import { ATSSidebar } from "@/components/dashboard/ATS-Sidebar";

export default function ATSMatchPage() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <ScanSearch className="w-6 h-6 text-[#1C4ED6]" />
            ATS Match Engine
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Upload your resume and paste a job description to instantly see your
            match score, missing skills, and get actionable suggestions.
          </p>
        </div>
      </div>

      {/* Main Component */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden min-h-[600px] shadow-sm">
        <ATSSidebar />
      </div>
    </div>
  );
}
