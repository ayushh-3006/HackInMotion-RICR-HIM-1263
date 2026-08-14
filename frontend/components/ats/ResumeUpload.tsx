"use client";

import React, { useRef, useState, useCallback } from "react";
import { UploadCloud, FileText, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

interface ResumeUploadProps {
  file: File | null;
  setFile: (file: File | null) => void;
  disabled?: boolean;
}

export default function ResumeUpload({
  file,
  setFile,
  disabled,
}: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = useCallback(
    (f: File) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        toast.error(
          "Unsupported file format. Please upload a PDF or DOCX file.",
          {
            id: "file-type-error",
          },
        );
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error("File too large. Maximum supported size is 5 MB.", {
          id: "file-size-error",
        });
        return;
      }
      setFile(f);
      toast.success("Resume attached successfully!");
    },
    [setFile],
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setDragActive(true);
  };

  const onDragLeave = () => setDragActive(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled) return;
    if (e.dataTransfer.files?.[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">
          Step 1: Upload Resume
        </h3>
        <p className="text-sm text-slate-500 font-medium">
          We support PDF and DOCX formats up to 5MB.
        </p>
      </div>

      <div
        className={`relative flex-1 flex flex-col items-center justify-center w-full min-h-[280px] border-2 rounded-3xl transition-all ${
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        } ${
          dragActive
            ? "border-indigo-400 bg-indigo-50/60"
            : file
              ? "border-indigo-200 bg-indigo-50/30"
              : "border-dashed border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-slate-100/50"
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !disabled && !file && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx"
          onChange={onFileChange}
          disabled={disabled}
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center w-full px-6"
            >
              <div className="w-full bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative group flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>

                <div className="flex-1 text-center sm:text-left overflow-hidden w-full">
                  <p
                    className="font-bold text-slate-800 truncate"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {file.type.includes("pdf") ? "PDF" : "DOCX"} •{" "}
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-3 text-emerald-600 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    Ready to analyze
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!disabled) {
                        setFile(null);
                        if (inputRef.current) inputRef.current.value = "";
                      }
                    }}
                    disabled={disabled}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!disabled) inputRef.current?.click();
                    }}
                    disabled={disabled}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Replace
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center p-6 text-center"
            >
              <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8 text-indigo-500" />
              </div>
              <p className="text-base font-bold text-slate-800 mb-1">
                Upload your resume
              </p>
              <p className="text-sm font-medium text-slate-500 mb-6 max-w-[250px]">
                Drag & drop your PDF or DOCX here
              </p>

              <div className="flex items-center gap-4 w-full max-w-[200px]">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Or
                </span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <span className="mt-6 px-6 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-indigo-600 hover:bg-slate-50 transition-colors pointer-events-none inline-block">
                Browse Files
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
