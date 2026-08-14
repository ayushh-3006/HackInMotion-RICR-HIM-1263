'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import {
  Mic, Play, Square, ChevronRight, Activity, CheckCircle2,
  Loader2, Sparkles, Volume2, Clock, AlertTriangle,
  Code, Server, Users, Layers, Pause, History, RotateCcw,
  TrendingUp, Zap, MessageCircle, Award, ChevronDown, ChevronUp
} from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';

/* ──────── Types ──────── */
type ViewState = 'setup' | 'active' | 'loading' | 'results';

interface FillerWord { word: string; count: number; }

interface AnswerResult {
  questionId: string;
  transcribedText: string;
  contentScore: number;
  toneScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  wpm: number;
  fillerWords: FillerWord[];
  confidenceLabel: string;
  idealAnswer: string;
  audioDurationSeconds: number;
}

interface SessionData {
  _id: string;
  jobRole: string;
  interviewType: string;
  category: string;
  difficulty: string;
  questions: { id: string; text: string }[];
  answers: AnswerResult[];
  overallScore: number;
  overallFeedback: string;
  status: string;
}

/* ──────── Category Cards ──────── */
const CATEGORIES = [
  { id: 'Frontend', label: 'Frontend', icon: Code, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { id: 'Backend', label: 'Backend', icon: Server, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { id: 'Behavioral', label: 'Behavioral', icon: Users, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  { id: 'System Design', label: 'System Design', icon: Layers, color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
];

const DIFFICULTIES = [
  { id: 'Easy', label: 'Easy', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'Medium', label: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'Hard', label: 'Hard', color: 'text-red-600 bg-red-50 border-red-200' },
];

/* ──────── Waveform Bars ──────── */
function WaveformBars({ volume, isActive }: { volume: number; isActive: boolean }) {
  const barCount = 24;
  return (
    <div className="flex items-end justify-center gap-[3px] h-16">
      {Array.from({ length: barCount }).map((_, i) => {
        const baseHeight = isActive ? 8 + Math.sin(i * 0.5) * 4 : 4;
        const dynamicHeight = isActive
          ? baseHeight + (volume / 255) * 40 * Math.abs(Math.sin((i + Date.now() / 100) * 0.3))
          : baseHeight;
        return (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-75 ${isActive ? 'bg-gradient-to-t from-indigo-500 to-violet-400' : 'bg-slate-200'}`}
            style={{ height: `${Math.max(4, dynamicHeight)}px` }}
          />
        );
      })}
    </div>
  );
}

/* ──────── Score Ring ──────── */
function ScoreRing({ score, size = 160, label }: { score: number; size?: number; label?: string }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = score / 50;
    const t = setInterval(() => {
      current += step;
      if (current >= score) { setAnimated(score); clearInterval(t); }
      else setAnimated(Math.floor(current));
    }, 16);
    return () => clearInterval(t);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 80) return { stroke: '#10B981', text: 'text-emerald-500', label: 'Excellent' };
    if (s >= 60) return { stroke: '#3B82F6', text: 'text-blue-500', label: 'Good' };
    if (s >= 40) return { stroke: '#F59E0B', text: 'text-amber-500', label: 'Fair' };
    return { stroke: '#EF4444', text: 'text-red-500', label: 'Needs Work' };
  };

  const colors = getColor(score);
  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animated / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={12} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={colors.stroke} strokeWidth={12} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-black tracking-tight ${colors.text}`}>{animated}</span>
          <span className="text-sm font-bold text-slate-300">/ 100</span>
        </div>
      </div>
      {label && <span className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>}
    </div>
  );
}

/* ──────── Mini Gauge (for WPM) ──────── */
function MiniGauge({ value, min, max, ideal, label, unit }: { value: number; min: number; max: number; ideal: [number, number]; label: string; unit: string }) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const inIdeal = value >= ideal[0] && value <= ideal[1];
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className={`text-lg font-black ${inIdeal ? 'text-emerald-600' : value < ideal[0] ? 'text-amber-500' : 'text-red-500'}`}>{value} <span className="text-xs font-medium text-slate-400">{unit}</span></span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
        {/* Ideal range indicator */}
        <div className="absolute h-full bg-emerald-100 rounded-full" style={{ left: `${((ideal[0] - min) / (max - min)) * 100}%`, width: `${((ideal[1] - ideal[0]) / (max - min)) * 100}%` }} />
        <div className={`h-full rounded-full transition-all duration-700 ${inIdeal ? 'bg-emerald-500' : value < ideal[0] ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-slate-400">Ideal: {ideal[0]}–{ideal[1]} {unit}</p>
    </div>
  );
}

/* ──────── Loading Steps ──────── */
function AnalysisLoading({ step }: { step: number }) {
  const steps = [
    { label: 'Transcribing voice...', icon: Mic },
    { label: 'Analyzing tone & pace...', icon: Activity },
    { label: 'Generating scorecard...', icon: Sparkles },
  ];
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
      <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-8 animate-pulse">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
      <div className="space-y-4 w-full max-w-sm">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-indigo-50 border border-indigo-200 shadow-sm' : isDone ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-100'}`}>
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : isActive ? (
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
              ) : (
                <Icon className="w-5 h-5 text-slate-300 shrink-0" />
              )}
              <span className={`text-sm font-semibold ${isActive ? 'text-indigo-700' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
/*  MAIN PAGE COMPONENT                                  */
/* ══════════════════════════════════════════════════════ */
export default function MockInterviewPage() {
  const { getToken } = useAuth();
  const [view, setView] = useState<ViewState>('setup');

  /* Setup State */
  const [jobRole, setJobRole] = useState('');
  const [experience, setExperience] = useState('mid');
  const [interviewType, setInterviewType] = useState('Technical');
  const [category, setCategory] = useState('Frontend');
  const [difficulty, setDifficulty] = useState('Medium');
  const [isLoading, setIsLoading] = useState(false);

  /* Active Interview State */
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState('');

  /* Loading State */
  const [loadingStep, setLoadingStep] = useState(0);

  /* Expanded ideal answers */
  const [expandedIdeal, setExpandedIdeal] = useState<Record<number, boolean>>({});

  const { isListening, transcript, interimTranscript, startListening, stopListening, metrics: speechMetrics } = useSpeechRecognition();
  const { volume, startAnalyzing, stopAnalyzing } = useAudioAnalyzer();

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  /* Keep editable transcript in sync with live recognition */
  useEffect(() => {
    if (isRecording) {
      setEditableTranscript(transcript + (interimTranscript ? ` ${interimTranscript}` : ''));
    }
  }, [transcript, interimTranscript, isRecording]);

  /* Elapsed time ticker */
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - recordingStartTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording, recordingStartTime]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  /* ── Start Interview ── */
  const handleStartInterview = async () => {
    if (!jobRole) return toast.error('Please enter a job role.');
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ jobRole, interviewType, experience, category, difficulty })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSession(data.session);
      setView('active');
      setCurrentQuestionIndex(0);
      setEditableTranscript('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to start interview');
    } finally {
      setIsLoading(false);
    }
  };

  /* ── TTS: play question ── */
  const playQuestion = () => {
    if (!synthRef.current || !session) return;
    const question = session.questions[currentQuestionIndex];
    if (!question) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(question.text);
    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);
    synthRef.current.speak(utterance);
  };

  /* ── Toggle recording ── */
  const toggleRecording = () => {
    if (isRecording) {
      stopListening();
      stopAnalyzing();
      setIsRecording(false);
      // Freeze the editable transcript with final text
      setEditableTranscript(prev => prev.trim());
    } else {
      if (synthRef.current) synthRef.current.cancel();
      setIsAiSpeaking(false);
      startListening();
      startAnalyzing();
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      setElapsedTime(0);
      setEditableTranscript('');
    }
  };

  /* ── Submit Answer ── */
  const submitAnswer = async () => {
    const finalText = editableTranscript.trim();
    if (!finalText) return toast.error("No answer text to submit.");
    if (!session) return;

    setIsSubmitting(true);
    if (isRecording) { stopListening(); stopAnalyzing(); setIsRecording(false); }

    // Switch to loading view
    setView('loading');
    setLoadingStep(0);

    try {
      const token = await getToken();
      const durationSeconds = Math.max(1, Math.floor((Date.now() - recordingStartTime) / 1000));
      const questionId = session.questions[currentQuestionIndex].id;

      // Step animation
      await new Promise(r => setTimeout(r, 800));
      setLoadingStep(1);
      await new Promise(r => setTimeout(r, 800));
      setLoadingStep(2);

      const res = await fetch(`${API_URL}/interview/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          sessionId: session._id,
          questionId,
          transcribedText: finalText,
          audioDurationSeconds: durationSeconds
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Answer analyzed!");
      setSession(data.session);

      if (currentQuestionIndex < session.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setEditableTranscript('');
        setView('active');
      } else {
        await completeInterview(data.session._id);
      }

    } catch (err: any) {
      toast.error(err.message || 'Failed to submit answer');
      setView('active');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Complete Interview ── */
  const completeInterview = async (sessionId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/interview/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSession(data.session);
      setView('results');
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete interview');
    }
  };

  /* ══════════════════════════════════════════════════════════ */
  /*  RENDER                                                    */
  /* ══════════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto py-4 px-4">

      {/* ═══════════ SETUP VIEW ═══════════ */}
      {view === 'setup' && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Mock Interview Studio</h1>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              Practice with AI-generated questions, speak your answers, and get instant feedback on content, pacing, and confidence.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-3xl mx-auto">
            <div className="space-y-8">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Interview Category</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => { setCategory(cat.id); setInterviewType(cat.id === 'Behavioral' ? 'Behavioral' : 'Technical'); }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? `${cat.bg} ${cat.border} ${cat.text} shadow-sm scale-[1.02]`
                            : 'border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? `bg-gradient-to-br ${cat.color} text-white` : 'bg-slate-100'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Difficulty</label>
                <div className="flex gap-3">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                        difficulty === d.id ? d.color : 'border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Role & Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Job Role</label>
                  <input
                    type="text"
                    value={jobRole}
                    onChange={e => setJobRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Experience Level</label>
                  <select
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-medium text-slate-700 appearance-none"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                  </select>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartInterview}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 mt-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                Start Interview Session
              </button>
            </div>
          </div>

          {/* History Link */}
          <div className="text-center mt-6">
            <a href="/dashboard/mock-interview/history" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
              <History className="w-4 h-4" />
              View Past Sessions
            </a>
          </div>
        </div>
      )}

      {/* ═══════════ ACTIVE INTERVIEW VIEW ═══════════ */}
      {view === 'active' && session && (
        <div className="flex-1 flex flex-col h-full animate-in fade-in duration-500">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">{session.jobRole}</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {session.category} · {session.difficulty} · Question {currentQuestionIndex + 1} of {session.questions.length}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Timer */}
              {isRecording && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-sm font-mono font-bold text-red-600">{formatTime(elapsedTime)}</span>
                </div>
              )}
              {/* Status Dot */}
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  {isRecording && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />}
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isRecording ? 'bg-red-500' : 'bg-slate-300'}`} />
                </span>
                <span className="text-xs font-semibold text-slate-500">{isRecording ? 'Recording' : 'Ready'}</span>
              </div>
            </div>
          </div>

          {/* Question Progress */}
          <div className="flex gap-1.5 mb-6">
            {session.questions.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
                i < currentQuestionIndex ? 'bg-emerald-400' : i === currentQuestionIndex ? 'bg-indigo-500' : 'bg-slate-200'
              }`} />
            ))}
          </div>

          {/* Main Interview Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
            {/* Question + TTS */}
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Question {currentQuestionIndex + 1}</span>
                  <h3 className="text-xl font-bold text-slate-800 leading-relaxed mt-1">
                    {session.questions[currentQuestionIndex]?.text}
                  </h3>
                </div>
                <button
                  onClick={playQuestion}
                  className={`p-3 rounded-xl shrink-0 transition-all ${
                    isAiSpeaking
                      ? 'bg-indigo-100 text-indigo-600 shadow-sm shadow-indigo-100'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  title="Listen to Question"
                >
                  <Volume2 className={`w-5 h-5 ${isAiSpeaking ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>

            {/* Waveform */}
            <div className="px-8 py-3 border-t border-b border-slate-100 bg-slate-50/50">
              <WaveformBars volume={volume} isActive={isRecording} />
            </div>

            {/* Editable Transcript */}
            <div className="flex-1 px-8 py-4 overflow-y-auto">
              {isRecording || editableTranscript ? (
                <textarea
                  value={editableTranscript}
                  onChange={e => setEditableTranscript(e.target.value)}
                  placeholder="Your transcribed answer will appear here. You can edit it before submitting."
                  className="w-full h-full min-h-[120px] resize-none text-base text-slate-700 leading-relaxed font-medium bg-transparent focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                />
              ) : (
                <div className="h-full flex items-center justify-center flex-col text-slate-400 gap-3 py-8">
                  <Mic className="w-8 h-8 opacity-40" />
                  <p className="text-sm">Click "Start Recording" to speak your answer.</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
              <button
                onClick={toggleRecording}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                  isRecording
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>

              <button
                onClick={submitAnswer}
                disabled={!editableTranscript.trim() || isSubmitting}
                className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition-all shadow-sm"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ ANALYSIS LOADING VIEW ═══════════ */}
      {view === 'loading' && <AnalysisLoading step={loadingStep} />}

      {/* ═══════════ RESULTS SCORECARD VIEW ═══════════ */}
      {view === 'results' && session && (
        <div className="animate-in slide-in-from-bottom-8 duration-500 pb-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">Interview Complete!</h1>
            <p className="text-slate-500 text-sm">{session.jobRole} · {session.category} · {session.difficulty}</p>
          </div>

          {/* Overall Score + Delivery Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Score Ring */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center shadow-sm">
              <ScoreRing score={session.overallScore} label="Overall Score" />
            </div>

            {/* Delivery Metrics */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-5">Delivery Metrics</h3>
              {(() => {
                const allAnswers = session.answers || [];
                const avgWpm = allAnswers.length > 0 ? Math.round(allAnswers.reduce((s, a) => s + (a.wpm || 0), 0) / allAnswers.length) : 0;
                const totalFillers = allAnswers.reduce((s, a) => s + (a.fillerWords || []).reduce((fs, f) => fs + f.count, 0), 0);
                const confidences = allAnswers.map(a => a.confidenceLabel).filter(Boolean);
                const dominantConfidence = confidences.length > 0 ? confidences.sort((a, b) => confidences.filter(v => v === a).length - confidences.filter(v => v === b).length).pop() : 'N/A';

                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MiniGauge value={avgWpm} min={0} max={250} ideal={[130, 160]} label="Avg. WPM" unit="wpm" />
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filler Words</span>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-black ${totalFillers <= 4 ? 'text-emerald-600' : totalFillers <= 8 ? 'text-amber-500' : 'text-red-500'}`}>{totalFillers}</span>
                        <span className="text-xs text-slate-400">detected</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {allAnswers.flatMap(a => a.fillerWords || []).reduce<FillerWord[]>((acc, fw) => {
                          const existing = acc.find(x => x.word === fw.word);
                          if (existing) existing.count += fw.count;
                          else acc.push({ ...fw });
                          return acc;
                        }, []).map((fw, i) => (
                          <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                            "{fw.word}" ×{fw.count}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                          dominantConfidence === 'Confident' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : dominantConfidence === 'Hesitant' ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : dominantConfidence === 'Fast-Paced' ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {dominantConfidence === 'Confident' && <Zap className="w-3.5 h-3.5 inline mr-1" />}
                          {dominantConfidence === 'Hesitant' && <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />}
                          {dominantConfidence === 'Fast-Paced' && <TrendingUp className="w-3.5 h-3.5 inline mr-1" />}
                          {dominantConfidence}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Per‑Question Breakdown */}
          <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-4">Question Breakdown</h3>
          <div className="space-y-6">
            {session.answers?.map((ans: AnswerResult, idx: number) => {
              const q = session.questions.find(sq => sq.id === ans.questionId);
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  {/* Question */}
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h4 className="font-bold text-base text-slate-900 flex gap-2">
                      <span className="text-indigo-500">Q{idx + 1}.</span> {q?.text}
                    </h4>
                  </div>

                  {/* Transcript */}
                  <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                    <p className="text-sm text-slate-600 italic leading-relaxed">"{ans.transcribedText}"</p>
                  </div>

                  {/* Scores & Metrics */}
                  <div className="px-6 py-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                      {/* Content Score */}
                      <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Content</p>
                        <p className={`text-2xl font-black ${ans.contentScore >= 80 ? 'text-emerald-600' : ans.contentScore >= 60 ? 'text-blue-500' : ans.contentScore >= 40 ? 'text-amber-500' : 'text-red-500'}`}>{ans.contentScore}</p>
                      </div>
                      {/* Tone Score */}
                      <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Delivery</p>
                        <p className={`text-2xl font-black ${ans.toneScore >= 80 ? 'text-emerald-600' : ans.toneScore >= 60 ? 'text-blue-500' : ans.toneScore >= 40 ? 'text-amber-500' : 'text-red-500'}`}>{ans.toneScore}</p>
                      </div>
                      {/* WPM */}
                      <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">WPM</p>
                        <p className={`text-2xl font-black ${ans.wpm >= 130 && ans.wpm <= 160 ? 'text-emerald-600' : 'text-amber-500'}`}>{ans.wpm || 0}</p>
                      </div>
                      {/* Confidence */}
                      <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Confidence</p>
                        <p className={`text-sm font-bold mt-1 ${
                          ans.confidenceLabel === 'Confident' ? 'text-emerald-600'
                          : ans.confidenceLabel === 'Hesitant' ? 'text-amber-500'
                          : ans.confidenceLabel === 'Fast-Paced' ? 'text-red-500'
                          : 'text-blue-500'
                        }`}>{ans.confidenceLabel || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Feedback */}
                    <p className="text-sm text-slate-700 leading-relaxed mb-4">{ans.feedback}</p>

                    {/* Tags: Strengths & Improvements */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {ans.strengths?.map((s, i) => (
                        <span key={`s-${i}`} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-semibold">✓ {s}</span>
                      ))}
                      {ans.improvements?.map((s, i) => (
                        <span key={`i-${i}`} className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-xs font-semibold">↑ {s}</span>
                      ))}
                    </div>

                    {/* Ideal Answer (Collapsible) */}
                    {ans.idealAnswer && (
                      <div>
                        <button
                          onClick={() => setExpandedIdeal(prev => ({ ...prev, [idx]: !prev[idx] }))}
                          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          {expandedIdeal[idx] ? 'Hide' : 'Show'} AI Ideal Response
                          {expandedIdeal[idx] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {expandedIdeal[idx] && (
                          <div className="mt-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                            <p className="text-sm text-indigo-800 leading-relaxed">{ans.idealAnswer}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => { setView('setup'); setSession(null); setCurrentQuestionIndex(0); setEditableTranscript(''); }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Start New Interview
            </button>
            <a
              href="/dashboard/mock-interview/history"
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
            >
              <History className="w-4 h-4" />
              View All Sessions
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
