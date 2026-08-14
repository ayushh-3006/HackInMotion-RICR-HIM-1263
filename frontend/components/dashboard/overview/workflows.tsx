"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Mic,
  UploadCloud,
  Type,
  Video,
  ArrowRight,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";

export function PrimaryWorkflows() {
  const router = useRouter();

  // Analyze State
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock Interview State
  type InterviewMode = "voice" | "text" | "video";
  const [mode, setMode] = useState<InterviewMode>("voice");

  // Handlers for Analyze Card
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (validTypes.includes(f.type) && f.size <= 10 * 1024 * 1024) {
      setFile(f);
    } else {
      alert("Please upload a valid PDF or DOCX file under 10MB.");
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate API delay
    setTimeout(() => {
      setIsAnalyzing(false);
      alert("Analysis complete! (Mock functionality)");
    }, 2000);
  };

  const canAnalyze = file !== null && jdText.trim().length > 20;

  // Handlers for Mock Interview Card
  const handleStartInterview = () => {
    router.push(`/dashboard/mock-interview?mode=${mode}`);
  };

  const getModeFeatures = (m: InterviewMode) => {
    switch (m) {
      case "voice":
        return [
          "Conversational AI voice practice",
          "Speech clarity & tone analysis",
          "Real-time verbal feedback",
        ];
      case "text":
        return [
          "Chat-based interview practice",
          "Structure & grammar evaluation",
          "Thought process analysis",
        ];
      case "video":
        return [
          "Full simulated environment",
          "Body language & eye contact tracking",
          "Comprehensive performance report",
        ];
    }
  };

  return (
    <div className="flex flex-col w-full">
      <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">
        Primary Workflows
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Analyze Resume & Job Description */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col w-full h-full">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                Analyze Resume & Job Description
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Upload your resume and paste the job description to get
                AI-powered analysis and match score.
              </p>
            </div>
          </div>

          <div
            className={`border-2 ${file ? "border-indigo-500 bg-indigo-50" : "border-dashed border-indigo-200 bg-indigo-50/50"} rounded-xl p-5 text-center mb-4 transition-colors hover:bg-indigo-50 cursor-pointer relative`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />
            {file ? (
              <div className="flex flex-col items-center justify-center">
                <FileText className="w-8 h-8 text-indigo-600 mb-2" />
                <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs font-medium text-slate-500 mb-3">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full text-slate-400 hover:text-red-500 shadow-sm border border-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">
                  Drag & drop your resume
                </p>
                <p className="text-xs font-medium text-slate-500 mb-3">
                  PDF, DOCX (Max 10MB)
                </p>
                <button className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors pointer-events-none">
                  Browse Files
                </button>
              </>
            )}
          </div>

          <div className="relative flex items-center py-2 mb-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase">
              OR
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="relative mb-4 flex-grow">
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="w-full h-full min-h-[96px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              placeholder="Paste job description here..."
            />
            <span
              className={`absolute bottom-2 right-2 text-[10px] font-bold ${jdText.length > 5000 ? "text-red-500" : "text-slate-400"}`}
            >
              {jdText.length} / 5000
            </span>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            className="w-full mt-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-bold text-sm shadow-sm shadow-indigo-200 flex items-center justify-center gap-2 transition-colors"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="text-indigo-200">✨</span>
            )}
            {isAnalyzing ? "Analyzing..." : "Analyze Now"}
          </button>
        </div>

        {/* Start AI Mock Interview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col w-full h-full">
          <div className="flex items-start gap-3 mb-6">
            <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                Start AI Mock Interview
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Practice interview questions based on your resume and target
                role.
              </p>
            </div>
          </div>

          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Choose Mode
          </h4>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => setMode("voice")}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${mode === "voice" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600"}`}
            >
              <Mic className="w-5 h-5" />
              <span className="text-xs font-bold">Voice</span>
            </button>
            <button
              onClick={() => setMode("text")}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${mode === "text" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600"}`}
            >
              <Type className="w-5 h-5" />
              <span className="text-xs font-bold">Text</span>
            </button>
            <button
              onClick={() => setMode("video")}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${mode === "video" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600"}`}
            >
              <Video className="w-5 h-5" />
              <span className="text-xs font-bold">Video</span>
            </button>
          </div>

          <ul className="space-y-3 mb-6 flex-grow">
            {getModeFeatures(mode).map((feature, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <CheckCircle2 className="w-4 h-4 text-purple-500" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={handleStartInterview}
            className="w-full mt-auto bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm shadow-purple-200 flex items-center justify-center gap-2 transition-colors"
          >
            Start Interview <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
