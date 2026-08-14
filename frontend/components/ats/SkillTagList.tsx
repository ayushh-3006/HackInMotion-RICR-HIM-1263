'use client';

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface SkillTagListProps {
  title: string;
  skills: string[];
  type: 'matched' | 'missing';
}

export default function SkillTagList({ title, skills, type }: SkillTagListProps) {
  if (!skills || skills.length === 0) return null;

  const isMatched = type === 'matched';
  const Icon = isMatched ? CheckCircle2 : XCircle;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 h-full">
      <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-4 flex items-center gap-2">
        <Icon className={`w-4 h-4 ${isMatched ? 'text-emerald-500' : 'text-rose-500'}`} />
        {title}
        <span className="ml-auto text-xs font-bold px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">
          {skills.length}
        </span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <span
            key={i}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              isMatched
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
