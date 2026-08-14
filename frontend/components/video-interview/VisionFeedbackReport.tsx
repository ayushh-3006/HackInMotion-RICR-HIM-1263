import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Activity, Eye, Meh, UserCheck } from 'lucide-react';

interface VisionFeedbackReportProps {
  session: any;
}

export function VisionFeedbackReport({ session }: VisionFeedbackReportProps) {
  if (!session || !session.answers || session.answers.length === 0) {
    return <div className="p-8 text-center text-slate-500">No session data available.</div>;
  }

  const allAnswers = session.answers;
  const avgEyeContact = Math.round(allAnswers.reduce((sum: number, a: any) => sum + (a.eyeContactScore || 0), 0) / allAnswers.length) || 0;
  const avgPosture = Math.round(allAnswers.reduce((sum: number, a: any) => sum + (a.postureScore || 0), 0) / allAnswers.length) || 0;
  const avgExpression = Math.round(allAnswers.reduce((sum: number, a: any) => sum + (a.expressionScore || 0), 0) / allAnswers.length) || 0;
  
  const overallBodyScore = Math.round((avgEyeContact + avgPosture + avgExpression) / 3) || 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'bg-blue-50 border-blue-200';
    if (score >= 40) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-2">Video Analysis Report</h2>
        <p className="text-slate-500">Body Language & Vision LLM Feedback</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl border ${getScoreBg(overallBodyScore)} flex flex-col items-center justify-center`}
        >
          <UserCheck className={`w-8 h-8 mb-2 ${getScoreColor(overallBodyScore)}`} />
          <span className="text-sm font-bold uppercase tracking-wider text-slate-600">Overall Grade</span>
          <span className={`text-5xl font-black mt-2 ${getScoreColor(overallBodyScore)}`}>{overallBodyScore}</span>
        </motion.div>

        <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-4">
          <MetricCard title="Eye Contact" score={avgEyeContact} icon={Eye} delay={0.1} />
          <MetricCard title="Posture Stability" score={avgPosture} icon={Activity} delay={0.2} />
          <MetricCard title="Expression Balance" score={avgExpression} icon={Meh} delay={0.3} />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800">Per-Question Vision Feedback</h3>
        {allAnswers.map((ans: any, idx: number) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * idx }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
          >
            <h4 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">Q{idx + 1}. Vision Analysis</h4>
            
            <div className="grid grid-cols-3 gap-4">
               <div className="text-center p-3 bg-slate-50 rounded-xl">
                 <p className="text-xs font-bold text-slate-400 uppercase">Eye Contact</p>
                 <p className={`text-xl font-black ${getScoreColor(ans.eyeContactScore || 0)}`}>{ans.eyeContactScore || 0}</p>
               </div>
               <div className="text-center p-3 bg-slate-50 rounded-xl">
                 <p className="text-xs font-bold text-slate-400 uppercase">Posture</p>
                 <p className={`text-xl font-black ${getScoreColor(ans.postureScore || 0)}`}>{ans.postureScore || 0}</p>
               </div>
               <div className="text-center p-3 bg-slate-50 rounded-xl">
                 <p className="text-xs font-bold text-slate-400 uppercase">Expression</p>
                 <p className={`text-xl font-black ${getScoreColor(ans.expressionScore || 0)}`}>{ans.expressionScore || 0}</p>
               </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <h5 className="text-sm font-bold text-indigo-800 mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> AI Body Language Feedback
              </h5>
              <p className="text-sm text-indigo-700 leading-relaxed">
                {ans.bodyLanguageFeedback || "No detailed vision feedback provided."}
              </p>
            </div>

            {ans.flaggedMoments && ans.flaggedMoments.length > 0 && (
              <div className="mt-4">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Flagged Moments
                </h5>
                <ul className="space-y-2">
                  {ans.flaggedMoments.map((flag: any, i: number) => (
                    <li key={i} className="text-sm flex items-center gap-2 text-slate-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                      <span className="font-mono font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-xs">
                        {Math.floor(flag.timestamp / 60)}:{(flag.timestamp % 60).toString().padStart(2, '0')}
                      </span>
                      {flag.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ title, score, icon: Icon, delay }: any) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 60) return 'text-blue-500';
    if (s >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between"
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-slate-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className={`text-4xl font-black ${getScoreColor(score)}`}>{score}</span>
        <span className="text-sm font-bold text-slate-300">/ 100</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: delay + 0.3, duration: 1 }}
          className={`h-full rounded-full ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
        />
      </div>
    </motion.div>
  );
}
