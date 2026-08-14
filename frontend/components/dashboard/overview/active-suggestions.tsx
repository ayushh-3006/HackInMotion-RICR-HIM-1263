"use client";

import { useState } from "react";
import {
  Lightbulb,
  Info,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Priority = "High" | "Medium" | "Low";
type Category = "[ATS Optimization]" | "[Impact Metrics]" | "[Formatting]";

interface SuggestionItem {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  explanation: string;
  before: string;
  after: string;
}

const suggestions: SuggestionItem[] = [
  {
    id: "s1",
    title: "Add quantifiable impact in your experience section",
    category: "[Impact Metrics]",
    priority: "High",
    icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    explanation:
      "ATS systems and recruiters look for measurable results to validate your skills.",
    before: "Developed new features for the company website.",
    after:
      "Developed 5 new interactive features, increasing user engagement by 25% over 3 months.",
  },
  {
    id: "s2",
    title: "Include these missing keywords: Docker, CI/CD, System Design",
    category: "[ATS Optimization]",
    priority: "Medium",
    icon: <Info className="w-4 h-4 text-blue-600" />,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    explanation:
      "The target job description heavily emphasizes these skills, but they are missing from your skills section.",
    before: "Skills: React, Node.js, AWS.",
    after: "Skills: React, Node.js, AWS, Docker, CI/CD, System Design.",
  },
  {
    id: "s3",
    title: "Improve your summary to highlight full-stack expertise",
    category: "[Formatting]",
    priority: "Low",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    explanation:
      "Your current summary is too generic and does not clearly position you as a full-stack engineer.",
    before: "Software Engineer with experience in web development.",
    after:
      "Results-driven Full-Stack Engineer with 3+ years of experience in React and Node.js...",
  },
];

export function ActiveSuggestions() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-amber-100 text-amber-700";
      case "Low":
        return "bg-emerald-100 text-emerald-700";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900">
          Active Optimization Suggestions
        </h3>
        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {suggestions.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-colors overflow-hidden ${isExpanded ? "border-indigo-200 bg-indigo-50/30" : "border-slate-100 hover:bg-slate-50"}`}
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleExpand(item.id)}
                className="flex items-center justify-between p-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 flex-grow">
                  <div
                    className={`w-8 h-8 rounded-full ${item.iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-medium transition-colors ${isExpanded ? "text-indigo-900" : "text-slate-700 group-hover:text-slate-900"}`}
                    >
                      {item.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-500">
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getPriorityBadge(item.priority)}`}
                      >
                        {item.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <ChevronRight
                      className={`w-4 h-4 transition-colors ${isExpanded ? "text-indigo-500" : "text-slate-400 group-hover:text-indigo-400"}`}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Accordion Content */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <div className="px-4 pb-4 pt-1 ml-11 border-t border-slate-100/50 mt-1">
                      <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                        {item.explanation}
                      </p>

                      <div className="bg-white rounded-lg p-3 border border-slate-200 mb-4 shadow-sm text-sm">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="font-bold text-red-500 flex-shrink-0">
                            Before:
                          </span>
                          <span className="text-slate-500 line-through">
                            {item.before}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-emerald-500 flex-shrink-0">
                            After:
                          </span>
                          <span className="text-slate-800 font-medium">
                            {item.after}
                          </span>
                        </div>
                      </div>

                      <button className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors">
                        Apply Suggestion
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
