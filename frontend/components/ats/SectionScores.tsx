'use client';

import React from 'react';

interface SectionScoresProps {
  scores?: Record<string, number>;
}

const sections = [
  { key: 'skills', label: 'Skills' },
  { key: 'experience', label: 'Experience' },
  { key: 'education', label: 'Education' },
  { key: 'projects', label: 'Projects' },
];

export default function SectionScores({ scores }: SectionScoresProps) {
  if (!scores) return null;

  return (
    <div className="space-y-4">
      {sections.map(({ key, label }) => {
        const val = scores?.[key] ?? 0;
        const getBarColor = (v: number) => {
          if (v >= 80) return 'bg-emerald-500';
          if (v >= 50) return 'bg-blue-500';
          return 'bg-amber-500';
        };
        return (
          <div key={key}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</span>
              <span className="text-xs font-bold text-slate-800">{val}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(val)}`}
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
