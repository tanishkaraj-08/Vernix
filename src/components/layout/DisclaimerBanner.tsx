import React, { useState } from 'react';
import { ShieldAlert, Info, X, Sparkles } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white text-xs px-4 py-2 flex items-center justify-between border-b border-blue-800/60 shadow-sm">
      <div className="flex items-center gap-2.5 overflow-x-auto whitespace-nowrap">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 font-semibold tracking-wide text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          SIH 2026 • Problem ID: SIH26264
        </span>
        <span className="text-slate-300">
          <strong className="text-white">VERINEX AI</strong> — AICTE Case Coordination Intelligence System
        </span>
        <span className="hidden md:inline-block text-slate-400">•</span>
        <span className="hidden md:flex items-center gap-1 text-slate-300">
          <Info className="w-3.5 h-3.5 text-amber-300 inline" />
          Fictional demonstration data. Human-in-the-loop: AI produces explainable recommendations, not auto-decisions.
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden lg:inline text-[11px] text-blue-200/80 bg-white/10 px-2 py-0.5 rounded">
          Team 197631
        </span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors"
          title="Dismiss notification banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

