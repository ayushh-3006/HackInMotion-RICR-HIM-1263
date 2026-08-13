'use client';

import React from 'react';
import { Zap } from 'lucide-react';

interface SuggestionsListProps {
  suggestions: string[];
}

export default function SuggestionsList({ suggestions }: SuggestionsListProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
        <Zap className="w-4 h-4 text-blue-500" />
        Improvement Suggestions
      </h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((suggestion, i) => (
          <li
            key={i}
            className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100"
          >
            <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[10px] font-black mt-0.5">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-slate-600 text-sm leading-relaxed font-medium">{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
