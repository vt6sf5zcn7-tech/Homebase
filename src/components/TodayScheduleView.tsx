import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  User,
  Users,
  Bell,
  Sparkles,
  ArrowRight,
  Coffee,
  CheckCircle2,
  Calendar as CalendarIcon,
  ChevronDown,
  Camera,
} from 'lucide-react';
import { SchoolPeriod, LetterDay, CalendarEvent } from '../types';
import { getSubjectEmoji } from '../utils/subjectEmoji';

interface TodayScheduleViewProps {
  currentLetterDay: LetterDay | null;
  isOffDay: boolean;
  offDayReason?: string;
  periods: SchoolPeriod[];
  calendarEvents: CalendarEvent[];
  pendingHomework?: any[];
  onNavigateToBalancer?: (selectedPeriodId?: string) => void;
  onPreviewLetterChange?: (letter: LetterDay) => void;
  onOpenPhotoScanner?: () => void;
}

export const TodayScheduleView: React.FC<TodayScheduleViewProps> = ({
  currentLetterDay,
  isOffDay,
  offDayReason,
  periods,
  calendarEvents,
  pendingHomework,
  onNavigateToBalancer,
  onOpenPhotoScanner,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter periods that are active on today's letter day
  const activePeriods = periods.filter(
    (p) => currentLetterDay && p.daysActive.includes(currentLetterDay)
  );

  // Time calculations
  const nowHours = currentTime.getHours();
  const nowMinutes = currentTime.getMinutes();
  const nowTimeInMinutes = nowHours * 60 + nowMinutes;

  const parseTimeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Find active period and next period
  let currentActivePeriod: SchoolPeriod | null = null;
  let nextUpcomingPeriod: SchoolPeriod | null = null;
  let minutesRemainingInActive = 0;

  for (let i = 0; i < activePeriods.length; i++) {
    const period = activePeriods[i];
    const startM = parseTimeToMinutes(period.startTime);
    const endM = parseTimeToMinutes(period.endTime);

    if (nowTimeInMinutes >= startM && nowTimeInMinutes <= endM) {
      currentActivePeriod = period;
      minutesRemainingInActive = endM - nowTimeInMinutes;
      nextUpcomingPeriod = activePeriods[i + 1] || null;
      break;
    } else if (nowTimeInMinutes < startM && !nextUpcomingPeriod) {
      nextUpcomingPeriod = period;
      break;
    }
  }

  // Today's calendar events (after school)
  const todayDateStr = currentTime.toISOString().split('T')[0];
  const todayEvents = calendarEvents.filter((e) => e.date === todayDateStr);

  return (
    <div className="space-y-6">
      {/* Live Active Period Card (Saturn Core Feature) */}
      {!isOffDay && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Period Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Period Tracker
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Day {currentLetterDay} Schedule
              </span>
            </div>

            {currentActivePeriod ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      Period {currentActivePeriod.periodNumber} • In Progress
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5 flex items-center gap-2.5">
                      <span className="text-3xl">{currentActivePeriod.emoji || getSubjectEmoji(currentActivePeriod.name, currentActivePeriod.isStudyHall)}</span>
                      <span>{currentActivePeriod.name}</span>
                    </h3>
                  </div>

                  <div className="text-left sm:text-right bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60 shrink-0">
                    <div className="text-2xl font-black text-indigo-300 font-mono">
                      {minutesRemainingInActive}m
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">remaining</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{currentActivePeriod.room}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{currentActivePeriod.teacher}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {currentActivePeriod.startTime} - {currentActivePeriod.endTime}
                    </span>
                  </div>
                </div>

                {/* Friends in this class (Saturn community feature) */}
                {currentActivePeriod.friends && currentActivePeriod.friends.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs text-slate-400">Classmates:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {currentActivePeriod.friends.map((friend, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-200 border border-slate-700"
                        >
                          {friend}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Current Status
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {nowTimeInMinutes < parseTimeToMinutes('08:00')
                    ? 'Classes have not started yet for today.'
                    : nowTimeInMinutes > parseTimeToMinutes('15:25')
                    ? 'School day has ended. Extracurriculars & homework balance active!'
                    : 'Passing period / break between classes.'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Review your assignments or jump straight into homework balancing.
                </p>
              </div>
            )}
          </div>

          {/* Next Period or Free Period Card */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Next Up
                </span>
                {nextUpcomingPeriod?.isStudyHall && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Free Period
                  </span>
                )}
              </div>

              {nextUpcomingPeriod ? (
                <div>
                  <h4 className="text-lg font-bold text-white leading-snug flex items-center gap-2">
                    <span className="text-2xl">{nextUpcomingPeriod.emoji || getSubjectEmoji(nextUpcomingPeriod.name, nextUpcomingPeriod.isStudyHall)}</span>
                    <span>{nextUpcomingPeriod.name}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Period {nextUpcomingPeriod.periodNumber} • {nextUpcomingPeriod.startTime} - {nextUpcomingPeriod.endTime}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Room {nextUpcomingPeriod.room} • {nextUpcomingPeriod.teacher}
                  </p>

                  {nextUpcomingPeriod.isStudyHall && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200">
                      <div className="font-semibold flex items-center gap-1.5 text-emerald-300">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        AI Study Slot Opportunity:
                      </div>
                      <p className="text-[11px] text-emerald-200/90 mt-0.5">
                        You have 52 minutes free during this study hall. Knock out homework before after-school practice!
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-3">
                  No more classes scheduled for today. Ready for afternoon study or activities!
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigateToBalancer()}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <span>Balance Homework with AI</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* Main Schedule Grid: Periods for Today's Letter Day */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-lg font-bold text-white">
              Today's Bell Schedule (Day {currentLetterDay || 'Off'})
            </h3>
            <p className="text-xs text-slate-400">
              Showing active classes assigned to Letter Day {currentLetterDay}. Periods not in this cycle are dropped today.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPhotoScanner && (
              <button
                id="schedule-scan-photo-btn"
                onClick={onOpenPhotoScanner}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 transition-colors shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scan Photo</span>
              </button>
            )}
            <span className="text-xs text-slate-400 font-medium">
              {activePeriods.length} active periods
            </span>
          </div>
        </div>

        {isOffDay ? (
          <div className="text-center py-12 px-4 rounded-xl bg-slate-850 border border-slate-800">
            <Coffee className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <h4 className="text-base font-bold text-white">
              No Classes Today: {offDayReason || 'School Closed'}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Your district letter cycle is safely paused. Use today to get ahead on upcoming assignments or relax without missing scheduled classes!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activePeriods.map((period) => {
              const isCurrent = currentActivePeriod?.id === period.id;
              const isPast =
                nowTimeInMinutes > parseTimeToMinutes(period.endTime);

              return (
                <div
                  key={period.id}
                  id={`period-card-${period.id}`}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/40 shadow-md'
                      : isPast
                      ? 'bg-slate-850/50 border-slate-800/80 text-slate-500 opacity-70'
                      : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-xs relative"
                      style={{ backgroundColor: period.color + '25', border: `1px solid ${period.color}60` }}
                    >
                      <span>{period.emoji || getSubjectEmoji(period.name, period.isStudyHall)}</span>
                      <span
                        className="absolute -bottom-1 -right-1 text-[9px] font-bold px-1 rounded text-white shadow-xs leading-tight"
                        style={{ backgroundColor: period.color }}
                      >
                        P{period.periodNumber}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">
                          {period.name}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider">
                            Now
                          </span>
                        )}
                        {period.isStudyHall && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Study Hall (Free)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1 font-mono text-slate-300">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {period.startTime} - {period.endTime}
                        </span>
                        <span>•</span>
                        <span>{period.room}</span>
                        <span>•</span>
                        <span>{period.teacher}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Classmates or Study Hall Action */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {period.isStudyHall ? (
                      <button
                        onClick={() => onNavigateToBalancer(period.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors flex items-center gap-1 border border-emerald-400/30"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Allocate Homework</span>
                      </button>
                    ) : period.friends && period.friends.length > 0 ? (
                      <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{period.friends.slice(0, 2).join(', ')}</span>
                        {period.friends.length > 2 && (
                          <span className="font-semibold text-slate-300">
                            +{period.friends.length - 2}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* After-School Activities & Synced Calendar Events (Apple & Google) */}
      {todayEvents.length > 0 && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-sky-400" />
              <h3 className="text-base font-bold text-white">
                After-School Events (Synced from Calendar)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Google & Apple Calendar
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {todayEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-850 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {evt.title}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {evt.source === 'google_calendar' ? 'Google' : 'Apple'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    {evt.startTime} - {evt.endTime}
                  </div>
                  {evt.location && (
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{evt.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
