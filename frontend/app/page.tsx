import Link from "next/link";
import {
  BrainCircuit,
  FileSearch,
  Mic,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#080808] px-6 text-white">
      <div className="flex flex-col items-center gap-6 text-center max-w-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl shadow-violet-500/30">
          <BrainCircuit size={28} className="text-white" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight">AI Career Coach</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Your personal AI-powered platform for resume analysis, ATS scoring,
          and mock interview practice.
        </p>
        <div className="flex gap-3 mt-2">
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500 transition-all"
          >
            Get Started <ArrowRight size={14} />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-all"
          >
            Sign In
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-4 w-full">
          {[
            { icon: FileSearch, label: "Resume Analysis" },
            { icon: Mic, label: "Mock Interviews" },
            { icon: BarChart3, label: "Progress Tracking" },
          ].map((f, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <f.icon size={20} className="text-violet-400" />
              <p className="text-xs font-medium text-zinc-300">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
