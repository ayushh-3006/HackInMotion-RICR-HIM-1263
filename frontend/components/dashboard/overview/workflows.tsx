"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
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
import { motion, AnimatePresence } from "framer-motion";

type InterviewMode = "voice" | "text" | "video";

export function PrimaryWorkflows() {
  const router = useRouter();
  const { getToken } = useAuth();

  // Analyze State
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock Interview State
  const [mode, setMode] = useState<InterviewMode>("voice");

  // Handlers for Analyze Card
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
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
    if (!validTypes.includes(f.type)) {
      toast.error("Please upload a valid PDF or DOCX file.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB.");
      return;
    }
    setFile(f);
    toast.success(`Uploaded: ${f.name}`);
  };

  const handleAnalyze = async () => {
    if (!file || jdText.trim().length <= 20) return;

    setIsAnalyzing(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required.");
        return;
      }

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const formData = new FormData();
      formData.append("resumeFile", file);
      formData.append("jobDescription", jdText);

      const response = await fetch(`${baseUrl}/ats/calculate-file`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      toast.success("Analysis complete! Redirecting…");
      router.push("/dashboard/ats");
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze = file !== null && jdText.trim().length > 20;

  // Handlers for Mock Interview Card
  const handleStartInterview = () => {
    router.push(`/dashboard/mock-interview?mode=${mode}`);
  };

  const getModeFeatures = (m: InterviewMode): string[] => {
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

  const modeConfig: { key: InterviewMode; icon: React.ReactNode; label: string }[] = [
    { key: "voice", icon: <Mic className="w-5 h-5" />, label: "Voice" },
    { key: "text", icon: <Type className="w-5 h-5" />, label: "Text" },
    { key: "video", icon: <Video className="w-5 h-5" />, label: "Video" },
  ];

  return (
    <div className="flex flex-col w-full">
      <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">
        Primary Workflows
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Analyze Resume & Job Description */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col w-full h-full"
        >
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
            <AnimatePresence mode="wait">
              {file ? (
                <motion.div
                  key="file-preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center"
                >
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
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full text-slate-400 hover:text-red-500 shadow-sm border border-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="upload-prompt"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">
                    Drag & drop your resume
                  </p>
                  <p className="text-xs font-medium text-slate-500 mb-3">
                    PDF, DOCX (Max 10MB)
                  </p>
                  <span className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors pointer-events-none inline-block">
                    Browse Files
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative flex items-center py-2 mb-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase">
              AND
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="relative mb-4 flex-grow">
            <textarea
              value={jdText}
              onChange={(e) => {
                if (e.target.value.length <= 5000) setJdText(e.target.value);
              }}
              maxLength={5000}
              className="w-full h-full min-h-[96px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              placeholder="Paste job description here..."
            />
            <span
              className={`absolute bottom-2 right-2 text-[10px] font-bold ${jdText.length > 4900 ? "text-red-500" : "text-slate-400"}`}
            >
              {jdText.length} / 5000
            </span>
          </div>

          <motion.button
            whileHover={{ scale: canAnalyze && !isAnalyzing ? 1.02 : 1 }}
            whileTap={{ scale: canAnalyze && !isAnalyzing ? 0.98 : 1 }}
            onClick={handleAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            className="w-full mt-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-bold text-sm shadow-sm shadow-indigo-200 flex items-center justify-center gap-2 transition-colors"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="text-indigo-200">✨</span>
            )}
            {isAnalyzing ? "Analyzing…" : "Analyze Now"}
          </motion.button>
        </motion.div>

        {/* Start AI Mock Interview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col w-full h-full"
        >
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
            {modeConfig.map((m) => (
              <motion.button
                key={m.key}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setMode(m.key)}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${mode === m.key ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600"}`}
              >
                {m.icon}
                <span className="text-xs font-bold">{m.label}</span>
              </motion.button>
            ))}
          </div>

          <ul className="space-y-3 mb-6 flex-grow">
            <AnimatePresence mode="wait">
              {getModeFeatures(mode).map((feature, idx) => (
                <motion.li
                  key={`${mode}-${idx}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 24 }}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600"
                >
                  <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  {feature}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartInterview}
            className="w-full mt-auto bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm shadow-purple-200 flex items-center justify-center gap-2 transition-colors"
          >
            Start Interview <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
