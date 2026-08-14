"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Library, Briefcase, ChevronRight, CheckCircle2 } from "lucide-react";

interface QuestionDef {
  id: string;
  type: string;
  question: string;
  contextOrScenario?: string;
  keyPointsExpected: string[];
  suggestedAnswerStructure: string;
  difficulty: string;
}

export default function QuestionBankPage() {
  const { getToken } = useAuth();
  
  const [industry, setIndustry] = useState("Tech & Software");
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Entry-Level / Fresher");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<QuestionDef[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) return;

    setLoading(true);
    setError("");
    setQuestions([]);

    try {
      const token = await getToken();
      const res = await fetch("http://localhost:5000/api/interview/questions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          industry,
          targetRole,
          experienceLevel,
          questionCount: 5,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate questions");
      }

      setQuestions(data.data.questions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Library className="w-6 h-6 text-indigo-600" />
          Industry-Specific Question Bank
        </h1>
        <p className="text-slate-500">
          Generate tailored interview questions based on your specific industry, role, and experience level.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700"
              >
                <option value="Tech & Software">Tech & Software</option>
                <option value="Finance & Banking">Finance & Banking</option>
                <option value="Marketing & Sales">Marketing & Sales</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Product Management">Product Management</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Target Role</label>
              <input
                type="text"
                placeholder="e.g. Senior React Developer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700"
              >
                <option value="Entry-Level / Fresher">Entry-Level / Fresher</option>
                <option value="Mid-Level (2-5 yrs)">Mid-Level (2-5 yrs)</option>
                <option value="Senior / Lead (5+ yrs)">Senior / Lead (5+ yrs)</option>
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end mt-4">
              <button
                type="submit"
                disabled={loading || !targetRole}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 px-8 rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Bank
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
          {error}
        </div>
      )}

      {questions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Your Tailored Question Bank</h2>
          <div className="grid grid-cols-1 gap-6">
            {questions.map((q, i) => (
              <div key={q.id || i} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 hover:border-indigo-200 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {q.type}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                      q.difficulty === 'Hard' ? 'bg-red-100 text-red-700' :
                      q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <span className="text-slate-400 font-medium text-sm">Question {i + 1}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
                  {q.question}
                </h3>
                
                {q.contextOrScenario && (
                  <div className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-700 italic">
                      <span className="font-bold text-slate-900 not-italic">Scenario: </span>
                      {q.contextOrScenario}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Key Points Expected
                    </h4>
                    <ul className="space-y-2">
                      {q.keyPointsExpected.map((kp, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0" />
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-500" />
                      Suggested Answer Structure
                    </h4>
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 h-full">
                      <p className="text-sm text-indigo-900/80 leading-relaxed">
                        {q.suggestedAnswerStructure}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
