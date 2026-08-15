"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Video, Play, Loader2 } from "lucide-react";
import { VideoInterviewRecorder } from "@/components/video-interview/VideoInterviewRecorder";
import { VisionFeedbackReport } from "@/components/video-interview/VisionFeedbackReport";
import { BodyLanguageMetrics } from "@/lib/BodyLanguageAnalyzer";

type ViewState = "setup" | "active" | "loading" | "results";

export default function VideoMockInterviewPage() {
  const { getToken } = useAuth();
  const [view, setView] = useState<ViewState>("setup");

  const [jobRole, setJobRole] = useState("");
  const [experience, setExperience] = useState("medium");
  const [category] = useState("Technical");
  const [difficulty] = useState("Medium");
  const [isLoading, setIsLoading] = useState(false);

  const [session, setSession] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const handleStartInterview = async () => {
    if (!jobRole) return toast.error("Please enter a job role.");
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/interview/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobRole,
          interviewType: "Technical",
          experience,
          category,
          difficulty,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSession(data.session);
      setView("active");
      setCurrentQuestionIndex(0);
      playQuestion(data.session.questions[0].text);
    } catch (err: any) {
      toast.error(err.message || "Failed to start interview");
    } finally {
      setIsLoading(false);
    }
  };

  const playQuestion = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const handleRecordingComplete = async (
    audioBlob: Blob,
    sampledFrames: string[],
    _metricsList: BodyLanguageMetrics[],
  ) => {
    if (!session) return;
    setView("loading");

    try {
      const token = await getToken();
      const questionId = session.questions[currentQuestionIndex].id;

      // 1. Submit Audio Answer (Transcription)
      const formData = new FormData();
      formData.append("audio", audioBlob, "interview.webm");
      formData.append("sessionId", session._id);
      formData.append("questionId", questionId);

      const audioRes = await fetch(`${API_URL}/interview/transcribe`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      let audioData = await audioRes.json();
      if (!audioRes.ok)
        throw new Error(audioData.error || "Failed to transcribe audio");

      const transcribedText =
        audioData.transcribedText || "No speech detected.";

      // 2. Submit Answer for Evaluation
      const submitRes = await fetch(`${API_URL}/interview/submit-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: session._id,
          questionId,
          transcribedText,
          audioDurationSeconds: Math.floor(audioBlob.size / 16000), // rough estimate
        }),
      });
      let submitData = await submitRes.json();
      if (!submitRes.ok)
        throw new Error(submitData.error || "Failed to evaluate answer");

      // 3. Submit Video Frames for Vision Analysis
      if (sampledFrames.length > 0) {
        const visionRes = await fetch(
          `${API_URL}/interview/analyze-video-frames`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              sessionId: session._id,
              questionId,
              frames: sampledFrames,
            }),
          },
        );

        const visionData = await visionRes.json();
        if (visionRes.ok) {
          submitData.session = visionData.session; // updated session with vision feedback
        } else {
          console.warn("Vision analysis failed:", visionData.error);
        }
      }

      setSession(submitData.session);

      if (currentQuestionIndex < session.questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setView("active");
        playQuestion(submitData.session.questions[nextIndex].text);
      } else {
        await completeInterview(submitData.session._id);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process answer.");
      setView("active");
    }
  };

  const completeInterview = async (sessionId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/interview/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSession(data.session);
      setView("results");
    } catch (err: any) {
      toast.error(err.message || "Failed to complete interview");
    }
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto px-4 pt-2 pb-8">
      {view === "setup" && (
        <div className="flex-1 flex flex-col items-center justify-start mt-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-200">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
            Video Mock Interview
          </h1>
          <p className="text-slate-500 text-center max-w-xl mb-12">
            Practice with an AI interviewer and get real-time feedback on your
            answers, eye contact, posture, and facial expressions.
          </p>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm w-full max-w-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Target Job Role
                </label>
                <select
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 appearance-none bg-white"
                >
                  <option value="">Select a role...</option>
                  <option value="Full Stack Developer">
                    Full Stack Developer
                  </option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Mobile App Developer">
                    Mobile App Developer
                  </option>
                  <option value="QA Automation Engineer">
                    QA Automation Engineer
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Interview Level
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 appearance-none bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStartInterview}
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
              Start Video Session
            </button>
          </div>
        </div>
      )}

      {view === "active" && session && (
        <div className="flex-1 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-500 w-full mt-4">
          <div className="w-full mb-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-slate-900">
              Q{currentQuestionIndex + 1}:{" "}
              {session.questions[currentQuestionIndex]?.text}
            </h2>
            <div className="flex gap-1.5 mt-4">
              {session.questions.map((_: any, i: number) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${i < currentQuestionIndex ? "bg-emerald-400" : i === currentQuestionIndex ? "bg-indigo-500" : "bg-slate-200"}`}
                />
              ))}
            </div>
          </div>

          <VideoInterviewRecorder
            onRecordingComplete={handleRecordingComplete}
            isAiSpeaking={isAiSpeaking}
          />
        </div>
      )}

      {view === "loading" && (
        <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Analyzing Video & Speech
          </h2>
          <p className="text-slate-500">
            Running Vision LLM and Body Language Metrics...
          </p>
        </div>
      )}

      {view === "results" && session && (
        <VisionFeedbackReport session={session} />
      )}
    </div>
  );
}
