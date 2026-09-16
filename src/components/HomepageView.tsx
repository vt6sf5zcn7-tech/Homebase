import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Camera,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  CheckSquare,
  MapPin,
  User,
  Coffee,
  MessageSquare,
  ShieldAlert,
  BatteryCharging,
  ArrowRight,
  Bell,
  BellOff,
} from 'lucide-react';
import {
  LetterDay,
  SchoolPeriod,
  ToDoItem,
  DistrictConfig,
  NotificationSettings,
} from '../types';
import {
  getLetterDayForDate,
  getUpcomingDaysForecast,
  getTodayDateStr,
  formatFullDate,
  offsetDateStr,
  formatFriendlyDate,
} from '../services/letterDayEngine';
import { getSubjectEmoji } from '../utils/subjectEmoji';

interface HomepageViewProps {
  currentLetterDay: LetterDay | null;
  isOffDay: boolean;
  offDayReason?: string;
  config: DistrictConfig;
  periods: SchoolPeriod[];
  todos: ToDoItem[];
  notificationSettings: NotificationSettings;
  onToggleTodo: (id: string) => void;
  onAddTodo: (todo: Omit<ToDoItem, 'id' | 'createdAt'>) => void;
  onOpenOverrideModal: () => void;
  onOpenPhotoScanner: () => void;
  onOpenShareModal: () => void;
  onOpenSyncOffDaysModal: () => void;
  onNavigateToSchedule: () => void;
  onNavigateToSceduals: () => void;
  onNavigateToTodo: () => void;
}

export const HomepageView: React.FC<HomepageViewProps> = ({
  currentLetterDay,
  isOffDay,
  offDayReason,
  config,
  periods,
  todos,
  notificationSettings,
  onToggleTodo,
  onAddTodo,
  onOpenOverrideModal,
  onOpenPhotoScanner,
  onOpenShareModal,
  onOpenSyncOffDaysModal,
  onNavigateToSchedule,
  onNavigateToSceduals,
  onNavigateToTodo,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'School' | 'Personal' | 'Clubs' | 'Urgent'>('School');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = getTodayDateStr();
  const tomorrowStr = offsetDateStr(todayStr, 1);
  const tomorrowCalc = getLetterDayForDate(tomorrowStr, config);

  // 5-day cycle preview starting today
  const cycleMiniForecast = getUpcomingDaysForecast(todayStr, 5, config);

  // Filter periods active on today's letter day
  const todayPeriods = periods.filter((p) => {
    if (!currentLetterDay) return false;
    return p.daysActive?.includes(currentLetterDay);
  });

  // Calculate if a period is happening right now
  const nowHours = currentTime.getHours();
  const nowMins = currentTime.getMinutes();
  const nowTotalMinutes = nowHours * 60 + nowMins;

  const getPeriodStatus = (startTime: string, endTime: string) => {
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    const sTotal = sH * 60 + sM;
    const eTotal = eH * 60 + eM;

    if (nowTotalMinutes >= sTotal && nowTotalMinutes <= eTotal) {
      return 'now';
    }
    if (nowTotalMinutes < sTotal && nowTotalMinutes >= sTotal - 20) {
      return 'next';
    }
    if (nowTotalMinutes > eTotal) {
      return 'past';
    }
    return 'upcoming';
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTodo({
      title: newTitle.trim(),
      category: newCategory,
      priority: 'normal',
      dueDate: todayStr,
      completed: false,
    });

    setNewTitle('');
    setIsQuickAddOpen(false);
  };

  const letterBadgeColors: Record<string, { bg: string; text: string; glow: string; border: string }> = {
    A: { bg: 'bg-blue-600', text: 'text-white', glow: 'shadow-blue-500/30', border: 'border-blue-400/40' },
    B: { bg: 'bg-purple-600', text: 'text-white', glow: 'shadow-purple-500/30', border: 'border-purple-400/40' },
    C: { bg: 'bg-amber-500', text: 'text-slate-950', glow: 'shadow-amber-500/30', border: 'border-amber-300/60' },
    D: { bg: 'bg-emerald-600', text: 'text-white', glow: 'shadow-emerald-500/30', border: 'border-emerald-400/40' },
    E: { bg: 'bg-rose-600', text: 'text-white', glow: 'shadow-rose-500/30', border: 'border-rose-400/40' },
    F: { bg: 'bg-cyan-500', text: 'text-slate-950', glow: 'shadow-cyan-500/30', border: 'border-cyan-300/60' },
  };

  const currentBadge = currentLetterDay ? letterBadgeColors[currentLetterDay] : null;
  const activeTodos = todos.filter((t) => !t.completed);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 px-1 sm:px-2 pb-16 text-left">
      {/* 1. iOS Top Header & Quick Glance */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 tracking-wide uppercase">
            <span>Schreiber High • 11050</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {formatFullDate(todayStr)}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="home-share-friends-btn"
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-xs font-semibold text-emerald-400 border border-emerald-500/30 transition-all shadow-sm active:scale-95"
            title="Share Schedule with Friends via Messages"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            id="home-scan-photo-btn"
            onClick={onOpenPhotoScanner}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700/80 transition-all shadow-sm active:scale-95"
            title="Scan Schedule Photo"
          >
            <Camera className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Scan</span>
          </button>
        </div>
      </div>

      {/* 2. Notification Banners (Morning ID & Night Chromebook) */}
      {notificationSettings.enabled && (
        <div className="space-y-2">
          {/* Morning School ID Alert */}
          {notificationSettings.morningSchoolIdReminder && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-200 shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block text-amber-100">
                    Morning Reminder: Don't forget to wear your school ID!
                  </span>
                  <span className="text-[11px] text-amber-300/80">
                    Required for Schreiber High entry at morning lobby check-in.
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 shrink-0">
                7:15 AM
              </span>
            </div>
          )}

          {/* Night Chromebook Reminder */}
          {notificationSettings.nightChromebookReminder && (
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between gap-3 text-blue-200 shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block text-blue-100">
                    Night Reminder: Don't forget to charge your Chromebook!
                  </span>
                  <span className="text-[11px] text-blue-300/80">
                    Plug in tonight so battery is 100% ready for tomorrow's classes.
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 shrink-0">
                8:30 PM
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. Apple-Style Hero Card: "What Day It Is" */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-semibold text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>District Verified 6-Day Cycle</span>
            </div>

            {isOffDay ? (
              <div className="pt-2">
                <h3 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                  No School Today
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {offDayReason || 'School is closed'}. District rotation pauses automatically.
                </p>
              </div>
            ) : (
              <div className="pt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Today is
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Day {currentLetterDay}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-1.5">
                  <span>Tomorrow is</span>
                  <button
                    onClick={onNavigateToSceduals}
                    className="font-bold text-indigo-300 hover:underline inline-flex items-center gap-0.5"
                  >
                    Day {tomorrowCalc.letter || (tomorrowCalc.isWeekend ? 'A (Mon)' : 'Off')}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <span className="text-slate-500">•</span>
                  <span>{todayPeriods.length} classes meet today</span>
                </p>
              </div>
            )}
          </div>

          {/* Letter Day Hero Disc */}
          <div className="flex flex-col items-center">
            {currentLetterDay ? (
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center font-black text-3xl sm:text-4xl shadow-xl ${
                  currentBadge?.bg || 'bg-amber-500'
                } ${currentBadge?.text || 'text-slate-950'} ${
                  currentBadge?.border || 'border-amber-300/40'
                } border-2 ${currentBadge?.glow || ''}`}
              >
                {currentLetterDay}
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold text-center px-1">
                OFF
              </div>
            )}

            <button
              id="home-override-day-btn"
              onClick={onOpenOverrideModal}
              className="mt-2 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors underline underline-offset-2"
            >
              Override Day
            </button>
          </div>
        </div>

        {/* 5-Day Mini Cycle Tracker */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Upcoming Cycle Days
            </span>
            <button
              id="home-view-all-sceduals-btn"
              onClick={onNavigateToSceduals}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              See Tomorrow & More
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {cycleMiniForecast.map((fc, i) => {
              const isToday = i === 0;
              return (
                <div
                  key={fc.date}
                  onClick={onNavigateToSceduals}
                  className={`p-2 rounded-xl text-center border transition-all cursor-pointer hover:border-indigo-500/60 ${
                    isToday
                      ? 'bg-indigo-600/20 border-indigo-500/50 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <div className="text-[10px] font-semibold text-slate-400">
                    {isToday ? 'Today' : formatFriendlyDate(fc.date).split(',')[0]}
                  </div>
                  <div
                    className={`text-sm sm:text-base font-black mt-0.5 ${
                      fc.letter ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {fc.letter ? `Day ${fc.letter}` : 'Off'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Today's Schedule Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Today's Schedule
                <span className="text-xs font-normal text-slate-400">
                  ({todayPeriods.length} classes on Day {currentLetterDay || 'C'})
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="home-open-schedule-tab-btn"
              onClick={onNavigateToSchedule}
              className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1"
            >
              Full Schedule
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Periods List */}
        {todayPeriods.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800 text-center space-y-3">
            <p className="text-xs sm:text-sm text-slate-400">
              No periods found active for Day {currentLetterDay || 'C'}.
            </p>
            <button
              id="empty-schedule-scan-btn"
              onClick={onOpenPhotoScanner}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
            >
              <Camera className="w-4 h-4" />
              Scan Schedule Photo
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayPeriods.slice(0, 5).map((period) => {
              const status = getPeriodStatus(period.startTime, period.endTime);
              const isNow = status === 'now';

              return (
                <div
                  key={period.id}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isNow
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md shadow-indigo-900/20 ring-1 ring-indigo-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 relative ${
                        isNow
                          ? 'bg-indigo-600/90 text-white shadow-md border border-indigo-400/50'
                          : 'bg-slate-800/90 border border-slate-700 text-slate-300'
                      }`}
                    >
                      <span>{period.emoji || getSubjectEmoji(period.name, period.isStudyHall)}</span>
                      <span className="absolute -bottom-1 -right-1 text-[9px] font-mono px-1 rounded bg-slate-900 border border-slate-700 text-slate-400 font-bold leading-tight">
                        P{period.periodNumber}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white truncate">
                          {period.name}
                        </span>
                        {isNow && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] tracking-wide animate-pulse">
                            NOW
                          </span>
                        )}
                        {period.isStudyHall && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                            Free Period
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {period.room}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          {period.teacher}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-300">
                      {period.startTime} - {period.endTime}
                    </span>
                  </div>
                </div>
              );
            })}

            {todayPeriods.length > 5 && (
              <button
                onClick={onNavigateToSchedule}
                className="w-full py-2 text-center text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                + View remaining {todayPeriods.length - 5} periods on Schedule tab →
              </button>
            )}
          </div>
        )}
      </div>

      {/* 5. To-Do List Card (Replacing Assignments Feature) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                To-Do Checklist
                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
                  {activeTodos.length} active
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="home-open-todo-tab-btn"
              onClick={onNavigateToTodo}
              className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-3 h-3" />
            </button>

            <button
              id="home-quick-add-todo-btn"
              onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Quick Add Form Drawer */}
        {isQuickAddOpen && (
          <form
            onSubmit={handleQuickAddSubmit}
            className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/40 space-y-3 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300">Add Quick Task</span>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Bring lab notebook to Period 1 Chem"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              >
                <option value="School">School</option>
                <option value="Urgent">Urgent</option>
                <option value="Personal">Personal</option>
                <option value="Clubs">Clubs</option>
              </select>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm"
                >
                  Save Task
                </button>
              </div>
            </div>
          </form>
        )}

        {/* To-Do Items List */}
        {todos.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            🎉 All caught up! No to-dos logged.
          </div>
        ) : (
          <div className="space-y-2">
            {todos.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleTodo(item.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  item.completed
                    ? 'bg-slate-950/30 border-slate-800/50 opacity-60'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <h4
                      className={`text-xs sm:text-sm font-semibold text-white truncate ${
                        item.completed ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {item.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-medium text-slate-300">
                        {item.category}
                      </span>
                      {item.dueDate && (
                        <span className="text-[11px] text-slate-400">
                          {formatFriendlyDate(item.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
