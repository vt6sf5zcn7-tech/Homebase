import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  ChevronRight,
  ChevronLeft,
  Share2,
  Calendar as CalendarIcon,
  Sun,
  ShieldCheck,
  AlertCircle,
  MapPin,
  User,
  Coffee,
  Sparkles,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { DistrictConfig, SchoolPeriod, LetterDay } from '../types';
import {
  getLetterDayForDate,
  getTodayDateStr,
  offsetDateStr,
  formatFriendlyDate,
  formatFullDate,
  isWeekend,
} from '../services/letterDayEngine';

interface SchedulesViewProps {
  config: DistrictConfig;
  periods: SchoolPeriod[];
  onOpenShareModal: () => void;
  onOpenPhotoScanner: () => void;
  onOpenOverrideModal: (date?: string) => void;
}

export const SchedulesView: React.FC<SchedulesViewProps> = ({
  config,
  periods,
  onOpenShareModal,
  onOpenPhotoScanner,
  onOpenOverrideModal,
}) => {
  const todayStr = getTodayDateStr();
  const [selectedDate, setSelectedDate] = useState<string>(offsetDateStr(todayStr, 1)); // defaults to tomorrow!
  const [daysHorizon, setDaysHorizon] = useState<number>(10);

  // Generate date range starting today for upcoming days
  const upcomingDays = Array.from({ length: daysHorizon }, (_, i) => {
    const dStr = offsetDateStr(todayStr, i);
    const calc = getLetterDayForDate(dStr, config);
    return {
      date: dStr,
      calc,
      isToday: i === 0,
      isTomorrow: i === 1,
    };
  });

  const selectedCalc = getLetterDayForDate(selectedDate, config);
  const isSelectedToday = selectedDate === todayStr;
  const isSelectedTomorrow = selectedDate === offsetDateStr(todayStr, 1);

  // Filter periods active for the selected letter day
  const selectedPeriods = selectedCalc.letter
    ? periods.filter((p) => p.daysActive?.includes(selectedCalc.letter!))
    : [];

  const letterBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
    A: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-400' },
    B: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-400' },
    C: { bg: 'bg-amber-500', text: 'text-slate-950', border: 'border-amber-300' },
    D: { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-400' },
    E: { bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-400' },
    F: { bg: 'bg-cyan-500', text: 'text-slate-950', border: 'border-cyan-300' },
  };

  const badgeStyle = selectedCalc.letter
    ? letterBadgeColors[selectedCalc.letter] || { bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-400' }
    : null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 px-2 pb-16 text-left">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
              Future Bell Schedules
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Schedules & Upcoming Days
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            View tomorrow's schedule and the proceeding days after with automatic holiday and weekend pauses.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="schedules-share-btn"
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-900/30 transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Share with Friends</span>
          </button>

          <button
            id="schedules-override-btn"
            onClick={() => onOpenOverrideModal(selectedDate)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-all"
          >
            <span>Override Day</span>
          </button>
        </div>
      </div>

      {/* 2. Horizontal Date Scroller: "Proceeding Days After" */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select a Day (Today, Tomorrow & Proceeding Days)
          </span>
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                isSelectedToday ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(offsetDateStr(todayStr, 1))}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                isSelectedTomorrow ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* Days Rail */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {upcomingDays.map((item) => {
            const isSelected = item.date === selectedDate;
            const letter = item.calc.letter;
            const isOff = item.calc.isOffDay;

            return (
              <button
                key={item.date}
                onClick={() => setSelectedDate(item.date)}
                className={`flex flex-col items-center min-w-[76px] sm:min-w-[88px] p-2.5 rounded-2xl border transition-all text-center shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600/30 border-indigo-500 shadow-md ring-2 ring-indigo-500/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  {item.isToday
                    ? 'Today'
                    : item.isTomorrow
                    ? 'Tomorrow'
                    : formatFriendlyDate(item.date).split(',')[0]}
                </span>

                <span className="text-[11px] font-medium text-slate-300 mt-0.5">
                  {formatFriendlyDate(item.date).split(',')[1]}
                </span>

                <div
                  className={`mt-1.5 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shadow-sm ${
                    letter
                      ? `${letterBadgeColors[letter]?.bg || 'bg-indigo-600'} ${letterBadgeColors[letter]?.text || 'text-white'}`
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {letter || 'OFF'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed View of Selected Day */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
        {/* Banner for selected date */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isSelectedToday ? "Today's Schedule" : isSelectedTomorrow ? "Tomorrow's Schedule" : 'Proceeding Day Schedule'}
              </span>
              {isSelectedTomorrow && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                  TOMORROW
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              {formatFullDate(selectedDate)}
            </h3>

            <p className="text-xs text-slate-400">
              {selectedCalc.explanation}
            </p>
          </div>

          {/* Letter Badge Display */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {selectedCalc.letter ? (
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg border-2 ${
                  badgeStyle?.bg || 'bg-indigo-600'
                } ${badgeStyle?.text || 'text-white'} ${badgeStyle?.border || 'border-indigo-400'}`}
              >
                {selectedCalc.letter}
              </div>
            ) : (
              <div className="px-4 py-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold text-center">
                <Coffee className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                School Closed
              </div>
            )}
          </div>
        </div>

        {/* Schedule Listing */}
        {selectedCalc.isOffDay ? (
          <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <Coffee className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">
              {selectedCalc.offDayReason || 'No School Scheduled'}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Enjoy your time off! The Schreiber High 6-day cycle pauses and resumes automatically on the next school day.
            </p>
          </div>
        ) : selectedPeriods.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-300">
              No classes configured for Day {selectedCalc.letter}.
            </p>
            <button
              onClick={onOpenPhotoScanner}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
            >
              Scan Schedule Photo
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>{selectedPeriods.length} Classes meeting on Day {selectedCalc.letter}</span>
              <span>Schreiber 9-Period Bell Schedule</span>
            </div>

            {selectedPeriods.map((period) => (
              <div
                key={period.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-black text-xs shrink-0">
                    P{period.periodNumber}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">
                        {period.name}
                      </span>
                      {period.isStudyHall && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                          Free / Study
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {period.room}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {period.teacher}
                      </span>
                      {period.friends && period.friends.length > 0 && (
                        <span className="text-[11px] text-indigo-400">
                          With: {period.friends.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-300">
                    {period.startTime} - {period.endTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
