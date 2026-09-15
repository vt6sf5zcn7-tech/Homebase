import React, { useState } from 'react';
import { Edit3, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { LetterDay, DistrictConfig } from '../types';
import { formatFriendlyDate } from '../services/letterDayEngine';

interface LetterDayOverrideModalProps {
  initialDate?: string;
  config: DistrictConfig;
  onSaveOverride: (date: string, letter: LetterDay | null) => void;
  onClose: () => void;
}

export const LetterDayOverrideModal: React.FC<LetterDayOverrideModalProps> = ({
  initialDate,
  config,
  onSaveOverride,
  onClose,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(initialDate || todayStr);
  const currentOverride = config.manualOverrides[selectedDate] || null;
  const [chosenLetter, setChosenLetter] = useState<LetterDay | null>(currentOverride);

  const letters: LetterDay[] = ['A', 'B', 'C', 'D', 'E', 'F'];

  const letterBadgeStyles: Record<string, string> = {
    A: 'bg-blue-500 text-white',
    B: 'bg-purple-500 text-white',
    C: 'bg-amber-500 text-white',
    D: 'bg-emerald-500 text-white',
    E: 'bg-rose-500 text-white',
    F: 'bg-cyan-500 text-white',
  };

  const handleSave = () => {
    onSaveOverride(selectedDate, chosenLetter);
    onClose();
  };

  const handleClearOverride = () => {
    onSaveOverride(selectedDate, null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white font-bold text-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Manual Letter Day Override
            </h3>
            <p className="text-xs text-slate-400">
              Force a specific letter if your school declared a custom schedule change.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Select Date to Override
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                const d = e.target.value;
                setSelectedDate(d);
                setChosenLetter(config.manualOverrides[d] || null);
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              {formatFriendlyDate(selectedDate)}
            </span>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-2">
              Choose Letter Day (A through F)
            </label>
            <div className="grid grid-cols-6 gap-2">
              {letters.map((ltr) => (
                <button
                  key={ltr}
                  type="button"
                  onClick={() => setChosenLetter(ltr)}
                  className={`h-12 rounded-xl font-black text-lg transition-all flex items-center justify-center ${
                    chosenLetter === ltr
                      ? `${letterBadgeStyles[ltr]} ring-2 ring-purple-400 shadow-md scale-105`
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {ltr}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-xl text-purple-200 text-[11px] leading-relaxed">
            <strong>Why this safeguard exists:</strong> Unlike Saturn which locks you into wrong schedules when administration changes a rotation, Homebase gives you absolute control with zero lag.
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-5 border-t border-slate-800 mt-5">
          {currentOverride ? (
            <button
              onClick={handleClearOverride}
              className="px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors border border-rose-800/40"
            >
              Clear Override
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!chosenLetter}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md border border-purple-400/30 disabled:opacity-50"
            >
              Apply Override
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
