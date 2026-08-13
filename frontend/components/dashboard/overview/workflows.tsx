'use client';

import { FileText, Mic, UploadCloud, Type, Video, ArrowRight, CheckCircle2 } from 'lucide-react';

export function PrimaryWorkflows() {
  return (
    <div className="flex flex-col w-full">
      <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Primary Workflows</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        
        {/* Analyze Resume & Job Description */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col w-full h-full">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Analyze Resume & Job Description</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Upload your resume and paste the job description to get AI-powered analysis and match score.
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl p-5 text-center mb-4 transition-colors hover:bg-indigo-50">
            <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Drag & drop your resume</p>
            <p className="text-xs font-medium text-slate-500 mb-3">PDF, DOCX (Max 10MB)</p>
            <button className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors">
              Browse Files
            </button>
          </div>

          <div className="relative flex items-center py-2 mb-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase">OR</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="relative mb-4 flex-grow">
            <textarea 
              className="w-full h-full min-h-[96px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              placeholder="Paste job description here..."
            />
            <span className="absolute bottom-2 right-2 text-[10px] font-bold text-slate-400">
              0 / 5000
            </span>
          </div>

          <button className="w-full mt-auto bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm shadow-indigo-200 flex items-center justify-center gap-2 transition-colors">
            <span className="text-indigo-200">✨</span> Analyze Now
          </button>
        </div>


        {/* Start AI Mock Interview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col w-full h-full">
          <div className="flex items-start gap-3 mb-6">
            <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Start AI Mock Interview</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Practice interview questions based on your resume and target role.
              </p>
            </div>
          </div>

          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Choose Mode
          </h4>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 border-purple-500 bg-purple-50 text-purple-700 transition-all">
              <Mic className="w-5 h-5" />
              <span className="text-xs font-bold">Voice</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600 transition-all">
              <Type className="w-5 h-5" />
              <span className="text-xs font-bold">Text</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600 transition-all">
              <Video className="w-5 h-5" />
              <span className="text-xs font-bold">Video</span>
            </button>
          </div>

          <ul className="space-y-3 mb-6 flex-grow">
            <li className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
              Personalized questions
            </li>
            <li className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
              AI evaluation & feedback
            </li>
            <li className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
              Detailed performance report
            </li>
          </ul>

          <button className="w-full mt-auto bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm shadow-purple-200 flex items-center justify-center gap-2 transition-colors">
            Start Interview <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
