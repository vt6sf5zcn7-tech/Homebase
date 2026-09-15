import React, { useState, useEffect } from 'react';
import {
  Home,
  Clock,
  CalendarDays,
  CheckSquare,
  Settings,
  Camera,
  MessageSquare,
  School,
  HelpCircle,
} from 'lucide-react';
import { LetterDay } from '../types';

export type NavTab = 'home' | 'sceduals' | 'schedule' | 'todo' | 'settings';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentLetterDay: LetterDay | null;
  isOffDay: boolean;
  schoolName: string;
  onOpenPhotoScanner: () => void;
  onOpenWelcomeModal: () => void;
  onOpenShareModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentLetterDay,
  isOffDay,
  schoolName,
  onOpenPhotoScanner,
  onOpenWelcomeModal,
  onOpenShareModal,
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        {/* Left: Branding & School */}
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-900/40 border border-indigo-400/30">
              <School className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Homebase
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Schreiber 11050
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[200px] sm:max-w-xs">
                {schoolName}
              </p>
            </div>
          </div>

          {/* Mobile Actions: Share, Scan, and Day Badge */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              id="mobile-share-btn"
              onClick={onOpenShareModal}
              className="p-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400"
              title="Share Schedule with Friends"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              id="mobile-scan-btn"
              onClick={onOpenPhotoScanner}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-indigo-400"
              title="Scan Schedule Photo"
            >
              <Camera className="w-4 h-4" />
            </button>

            {isOffDay ? (
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                OFF
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-amber-500 text-slate-950 shadow-md border border-amber-300">
                DAY {currentLetterDay}
              </span>
            )}
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 overflow-x-auto scrollbar-none">
          <button
            id="nav-tab-home"
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'home'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            id="nav-tab-sceduals"
            onClick={() => setActiveTab('sceduals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'sceduals'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-indigo-300" />
            <span>Sceduals</span>
          </button>

          <button
            id="nav-tab-schedule"
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Today</span>
          </button>

          <button
            id="nav-tab-todo"
            onClick={() => setActiveTab('todo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'todo'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>To-Do</span>
          </button>

          <button
            id="nav-tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-slate-300" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Right: Quick actions, Live Time & Messages Share */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            id="header-share-btn"
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 shadow-sm transition-colors"
            title="Share Schedule with Friends"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            id="header-scan-photo-btn"
            onClick={onOpenPhotoScanner}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 shadow-sm transition-colors"
            title="Scan Schedule Photo"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Photo</span>
          </button>

          <button
            id="header-welcome-btn"
            onClick={onOpenWelcomeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Welcome Tour"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <div className="text-right border-l border-slate-800 pl-2.5">
            <div className="text-xs font-bold text-slate-200">{formattedTime}</div>
            <div className="text-[10px] text-slate-400 font-medium">{formattedDate}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
