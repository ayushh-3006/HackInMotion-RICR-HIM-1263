'use client';

import React from 'react';
import { Zap } from 'lucide-react';

interface SuggestionsListProps {
  suggestions: string[];
}

export default function SuggestionsList({ suggestions }: SuggestionsListProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-5 flex items-center gap-2">
        <Zap className="w-4 h-4 text-indigo-500" />
        Improvement Suggestions
      </h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion, i) => (
          <li
            key={i}
            className="flex items-start gap-4 bg-white hover:bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 text-white text-xs font-bold mt-0.5 shadow-sm">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-slate-700 text-base leading-relaxed font-medium">{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
