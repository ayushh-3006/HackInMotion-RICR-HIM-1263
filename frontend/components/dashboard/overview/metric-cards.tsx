"use client";

import React, { useMemo } from "react";
import { FileText, Target, Mic, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  status: string;
  statusColor: string;
  ringColor: string;
  progress: number;
  icon: React.ReactNode;
}

interface MetricCardsProps {
  atsHistory?: any[];
  interviewsHistory?: any[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      type: "spring" as const,
      stiffness: 260,
      damping: 20,
    },
  }),
};

export function MetricCards({
  atsHistory = [],
  interviewsHistory = [],
}: MetricCardsProps) {
  // Calculations
  const resumesScanned = atsHistory.length;

  const avgAtsScore = useMemo(() => {
    if (resumesScanned === 0) return 0;
    const sum = atsHistory.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return Math.round(sum / resumesScanned);
  }, [atsHistory, resumesScanned]);

  const mockInterviews = interviewsHistory.length;

  const avgInterviewScore = useMemo(() => {
    if (mockInterviews === 0) return 0;
    const sum = interviewsHistory.reduce(
      (acc, curr) => acc + (curr.overallScore || 0),
      0,
    );
    return Math.round(sum / mockInterviews);
  }, [interviewsHistory, mockInterviews]);

  // Color helpers
  const getScoreStatus = (score: number): string => {
    if (score === 0) return "No Data";
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Average";
    return "Needs Work";
  };

  const getScoreColor = (score: number): string => {
    if (score === 0) return "bg-slate-100 text-slate-700";
    if (score >= 80) return "bg-emerald-100 text-emerald-700";
    if (score >= 60) return "bg-amber-100 text-amber-700";
    return "bg-rose-100 text-rose-700";
  };

  const getRingColor = (score: number): string => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
      {/* 1. Resumes Scanned */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <MetricCard
          title="Resumes Scanned"
          value={resumesScanned.toString()}
          status={resumesScanned > 0 ? "Active" : "Get Started"}
          statusColor="bg-indigo-100 text-indigo-700"
          ringColor="text-indigo-500"
          progress={resumesScanned > 0 ? Math.min(resumesScanned * 10, 100) : 0}
          icon={<FileText className="w-5 h-5 text-indigo-500" />}
        />
      </motion.div>

      {/* 2. Avg ATS Match */}
      <motion.div
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <MetricCard
          title="Avg ATS Match"
          value={
            <span className="flex items-baseline gap-1">
              {avgAtsScore}
              <span className="text-sm text-slate-400 font-medium">/100</span>
            </span>
          }
          status={getScoreStatus(avgAtsScore)}
          statusColor={getScoreColor(avgAtsScore)}
          ringColor={getRingColor(avgAtsScore)}
          progress={avgAtsScore}
          icon={<Target className={`w-5 h-5 ${getRingColor(avgAtsScore)}`} />}
        />
      </motion.div>

      {/* 3. Mock Interviews */}
      <motion.div
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <MetricCard
          title="Mock Interviews"
          value={mockInterviews.toString()}
          status={mockInterviews > 0 ? "Active" : "No Sessions"}
          statusColor="bg-purple-100 text-purple-700"
          ringColor="text-purple-500"
          progress={mockInterviews > 0 ? Math.min(mockInterviews * 10, 100) : 0}
          icon={<Mic className="w-5 h-5 text-purple-500" />}
        />
      </motion.div>

      {/* 4. Avg Interview Score */}
      <motion.div
        custom={3}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <MetricCard
          title="Avg Interview Score"
          value={
            <span className="flex items-baseline gap-1">
              {avgInterviewScore}
              <span className="text-sm text-slate-400 font-medium">/100</span>
            </span>
          }
          status={getScoreStatus(avgInterviewScore)}
          statusColor={getScoreColor(avgInterviewScore)}
          ringColor={getRingColor(avgInterviewScore)}
          progress={avgInterviewScore}
          icon={
            <Activity
              className={`w-5 h-5 ${getRingColor(avgInterviewScore)}`}
            />
          }
        />
      </motion.div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  status,
  statusColor,
  ringColor,
  progress,
  icon,
}: MetricCardProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - ((progress || 0) / 100) * circumference;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group h-full flex flex-col justify-between gap-4">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
        {title}
      </h3>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-black text-slate-900 mb-2">{value}</div>
          <div
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${statusColor}`}
          >
            {status}
          </div>
        </div>

        {/* Circular Chart */}
        <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              className="text-slate-100 stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
            />
            <motion.circle
              className={`${ringColor} stroke-current`}
              strokeWidth="8"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center shadow-sm rounded-full w-10 h-10 m-auto bg-white border border-slate-100 group-hover:scale-110 transition-transform">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
