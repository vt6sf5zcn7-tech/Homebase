import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Edit3,
  CalendarCheck2,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { LetterDay, DistrictConfig } from '../types';
import { LetterDayCalculation } from '../services/letterDayEngine';

interface LetterDayBannerProps {
  calculation: LetterDayCalculation;
  config: DistrictConfig;
  onOpenOverrideModal: () => void;
  onOpenEngineTab: () => void;
}

export const LetterDayBanner: React.FC<LetterDayBannerProps> = ({
  calculation,
  config,
  onOpenOverrideModal,
  onOpenEngineTab,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  // Color mapping for letter days
  const letterColors: Record<string, { bg: string; text: string; border: string; pill: string }> = {
    A: { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200', pill: 'bg-blue-50 text-blue-800' },
    B: { bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-200', pill: 'bg-purple-50 text-purple-800' },
    C: { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', pill: 'bg-amber-50 text-amber-800' },
    D: { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', pill: 'bg-emerald-50 text-emerald-800' },
    E: { bg: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-200', pill: 'bg-rose-50 text-rose-800' },
    F: { bg: 'bg-cyan-500', text: 'text-cyan-700', border: 'border-cyan-200', pill: 'bg-cyan-50 text-cyan-800' },
  };

  const currentTheme = calculation.letter ? letterColors[calculation.letter] : null;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden transition-all">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Main Letter Indicator */}
          <div className="flex items-start sm:items-center gap-4">
            {calculation.isOffDay ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex flex-col items-center justify-center shrink-0 text-amber-300 shadow-md">
                <span className="text-xl sm:text-2xl font-black">OFF</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">No School</span>
              </div>
            ) : (
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${
                  currentTheme?.bg || 'bg-indigo-600'
                } text-white flex flex-col items-center justify-center shrink-0 shadow-lg border border-white/20`}
              >
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider opacity-90">
                  DAY
                </span>
                <span className="text-3xl sm:text-4xl font-black leading-none tracking-tight">
                  {calculation.letter}
                </span>
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  District Calendar Verified
                </span>

                {calculation.isOverridden && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-flex items-center gap-1">
                    <Edit3 className="w-3 h-3" />
                    Manual Override Active
                  </span>
                )}

                <span className="text-xs text-slate-400 font-medium">
                  {config.cycleLength}-Day Rotating Cycle
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {calculation.isOffDay
                  ? `School Closed: ${calculation.offDayReason}`
                  : `Today is Day ${calculation.letter} at ${config.schoolName}`}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 font-medium max-w-2xl">
                {calculation.isOffDay
                  ? `Cycle is paused. The next school day resumes as Day ${calculation.nextSchoolDayLetter}.`
                  : `All periods scheduled for Day ${calculation.letter} will meet today. Synchronized with the district calendar.`}
              </p>
            </div>
          </div>

          {/* Right Actions & Saturn Safeguard */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
            <button
              id="btn-why-day-letter"
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
            >
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              Why Day {calculation.letter || 'Off'}?
            </button>

            <button
              id="btn-override-letter"
              onClick={onOpenOverrideModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
            >
              <Edit3 className="w-4 h-4 text-slate-400" />
              Override Letter
            </button>

            <button
              id="btn-open-engine"
              onClick={onOpenEngineTab}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-md border border-indigo-400/30"
            >
              <span>District Sync</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Explanation Panel (Why Saturn broke vs how we protect) */}
        {showExplanation && (
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs sm:text-sm text-slate-300 space-y-2 bg-slate-850 p-4 rounded-xl border border-slate-800">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-semibold block mb-1">
                  How Homebase Prevents the Saturn Wrong-Day Bug:
                </strong>
                <p className="text-slate-400 leading-relaxed mb-2 text-xs">
                  Saturn frequently miscalculated letter days by running a naive 5-day cycle or relying on unverified community inputs.
                  When school districts had snow days, emergency closures, or superintendent conference days, Saturn advanced the cycle anyway,
                  causing students to show up prepared for the wrong classes. Homebase actively parses the district's verified calendar, freezes the cycle during closures, and gives you instant manual override authority.
                </p>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-200">
                    {config.schoolName} District Rule Applied:
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    Cycle Policy: <span className="font-semibold text-indigo-400">{config.offDayPolicy === 'pause_cycle' ? 'PAUSE CYCLE (Letters freeze during closures)' : 'SKIP'}</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    {calculation.explanation}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
