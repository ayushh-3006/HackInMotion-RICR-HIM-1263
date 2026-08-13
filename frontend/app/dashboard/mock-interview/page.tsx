'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, Loader2, Download } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

export default function ResumeEnhancerPage() {
  const { getToken } = useAuth();
  
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleEnhance = async () => {
    if (!role) return toast.error("Please select a target role.");
    if (!file) return toast.error("Please upload your resume (PDF).");
    if (!jobDescription) return toast.error("Please paste the job description.");

    setIsEnhancing(true);
    setResultPdfUrl(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('role', role);
      formData.append('jobDescription', jobDescription);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/resume/enhance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enhance resume");
      }

      toast.success("Resume enhanced successfully!");
      if (data.data?.pdfUrl) {
        // Backend returns a relative URL, map it to full URL
        setResultPdfUrl(`http://localhost:5000${data.data.pdfUrl}`);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during enhancement");
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-3">
          • AI Resume Enhancer •
        </p>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Tailor your resume for any <span className="text-indigo-600">role</span>
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          Upload your resume and paste the job description. The AI will align your experience to the role and generate an optimized PDF.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Stepper visual */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-indigo-600 font-medium">
            <span className="w-5 h-5 rounded-full border border-indigo-600 flex items-center justify-center text-xs">1</span>
            Resume
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-2 text-slate-500">
            <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-xs">2</span>
            Job details
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-2 text-slate-500">
            <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-xs">3</span>
            Enhance
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-xs font-semibold text-indigo-500 tracking-wider mb-2 uppercase">Select Target Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-700 bg-white"
            >
              <option value="">Choose a role</option>
              <option value="software-engineer">Software Engineer</option>
              <option value="product-manager">Product Manager</option>
              <option value="data-scientist">Data Scientist</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume Upload */}
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-indigo-500 tracking-wider mb-2 uppercase">Your Resume</label>
              <div 
                className={`flex-1 min-h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-colors
                  ${file ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                />
                
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileText className="w-10 h-10 text-indigo-500 mb-3" />
                    <p className="font-medium text-slate-700">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button 
                      onClick={() => setFile(null)}
                      className="mt-4 text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="font-medium text-slate-700 mb-1">Drop PDF here</p>
                    <p className="text-sm text-slate-500">
                      or <button onClick={() => fileInputRef.current?.click()} className="text-indigo-600 hover:underline">browse file</button>
                      <span className="mx-1">•</span>max 10MB
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-indigo-500 tracking-wider mb-2 uppercase">Job Description</label>
              <div className="flex-1 min-h-[200px] relative">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description or role requirements..."
                  className="w-full h-full p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-700 resize-none"
                />
                <div className="absolute bottom-3 right-4 text-xs text-slate-400">
                  {jobDescription.length} / 3000
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between mt-auto">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">i</span>
            Files are processed securely and not stored.
          </p>
          
          <div className="flex items-center gap-3">
            {resultPdfUrl && (
              <a 
                href={resultPdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                <Download className="w-4 h-4" /> View PDF
              </a>
            )}
            
            <button
              onClick={handleEnhance}
              disabled={isEnhancing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 transition-colors disabled:opacity-70"
            >
              {isEnhancing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Enhance resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
