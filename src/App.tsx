import React, { useState, useEffect } from 'react';
import {
  mockDistrictConfig,
  mockSchoolPeriods,
  mockTodos,
  mockNotificationSettings,
  mockCalendarEvents,
} from './data/mockSchoolData';
import {
  DistrictConfig,
  SchoolPeriod,
  ToDoItem,
  NotificationSettings,
  CalendarEvent,
  LetterDay,
  OffDay,
} from './types';
import { getLetterDayForDate, getTodayDateStr } from './services/letterDayEngine';
import { Header, NavTab } from './components/Header';
import { HomepageView } from './components/HomepageView';
import { SchedulesView } from './components/SchedulesView';
import { TodayScheduleView } from './components/TodayScheduleView';
import { TodoListView } from './components/TodoListView';
import { SettingsView } from './components/SettingsView';
import { LetterDayBanner } from './components/LetterDayBanner';
import { LetterDayOverrideModal } from './components/LetterDayOverrideModal';
import { SchedulePhotoScannerModal } from './components/SchedulePhotoScannerModal';
import { WelcomeModal } from './components/WelcomeModal';
import { ShareScheduleModal } from './components/ShareScheduleModal';
import { SyncOffDaysModal } from './components/SyncOffDaysModal';
import { Home, CalendarDays, Clock, CheckSquare, Settings } from 'lucide-react';

export default function App() {
  // Navigation tab (Home, Sceduals, Schedule/Today, Todo, Settings)
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Welcome modal for first-time users
  const [welcomeModalOpen, setWelcomeModalOpen] = useState<boolean>(() => {
    return !localStorage.getItem('homebase_has_seen_welcome');
  });

  // Schedule photo scanner modal
  const [photoScannerOpen, setPhotoScannerOpen] = useState(false);

  // Share with friends modal
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Sync off days modal
  const [syncOffDaysModalOpen, setSyncOffDaysModalOpen] = useState(false);

  // Core district configuration (persisted)
  const [districtConfig, setDistrictConfig] = useState<DistrictConfig>(() => {
    const saved = localStorage.getItem('orbit_district_config');
    return saved ? JSON.parse(saved) : mockDistrictConfig;
  });

  // School periods schedule (persisted)
  const [periods, setPeriods] = useState<SchoolPeriod[]>(() => {
    const saved = localStorage.getItem('orbit_periods');
    return saved ? JSON.parse(saved) : mockSchoolPeriods;
  });

  // To-Do list items (persisted)
  const [todos, setTodos] = useState<ToDoItem[]>(() => {
    const saved = localStorage.getItem('orbit_todos');
    return saved ? JSON.parse(saved) : mockTodos;
  });

  // Notification settings (persisted)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('orbit_notification_settings');
    return saved ? JSON.parse(saved) : mockNotificationSettings;
  });

  // Calendar events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('orbit_calendar_events');
    return saved ? JSON.parse(saved) : mockCalendarEvents;
  });

  // Override modal state
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideTargetDate, setOverrideTargetDate] = useState<string | undefined>(undefined);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('orbit_district_config', JSON.stringify(districtConfig));
  }, [districtConfig]);

  useEffect(() => {
    localStorage.setItem('orbit_periods', JSON.stringify(periods));
  }, [periods]);

  useEffect(() => {
    localStorage.setItem('orbit_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('orbit_notification_settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  useEffect(() => {
    localStorage.setItem('orbit_calendar_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  // Push / Local notifications scheduler effect
  useEffect(() => {
    if (!notificationSettings.enabled) return;

    // Check once per minute for notification triggers
    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMins}`;

      // 1. Morning School ID reminder
      if (
        notificationSettings.morningSchoolIdReminder &&
        currentTimeStr === notificationSettings.morningReminderTime
      ) {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('Wear Your School ID', {
            body: 'Don’t forget to wear your school ID before heading out to Schreiber High!',
            icon: '/favicon.ico',
          });
        }
      }

      // 2. Night Chromebook reminder
      if (
        notificationSettings.nightChromebookReminder &&
        currentTimeStr === notificationSettings.nightReminderTime
      ) {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('Charge Your Chromebook', {
            body: 'Don’t forget to charge your Chromebook tonight for tomorrow’s classes!',
            icon: '/favicon.ico',
          });
        }
      }
    }, 60000);

    return () => clearInterval(checkInterval);
  }, [notificationSettings]);

  // Calculate current letter day using consistent today string
  const todayStr = getTodayDateStr();
  const calculation = getLetterDayForDate(todayStr, districtConfig);

  // Close welcome modal and remember in localStorage
  const handleCloseWelcome = () => {
    localStorage.setItem('homebase_has_seen_welcome', 'true');
    setWelcomeModalOpen(false);
  };

  // Open photo scanner from welcome modal
  const handleOpenPhotoScannerFromWelcome = () => {
    handleCloseWelcome();
    setPhotoScannerOpen(true);
  };

  // Apply periods from AI schedule scanner
  const handleApplyImportedPeriods = (importedPeriods: SchoolPeriod[]) => {
    setPeriods(importedPeriods);
    setActiveTab('home');
  };

  // Override handler
  const handleSaveOverride = (date: string, letter: LetterDay | null) => {
    const updatedOverrides = { ...districtConfig.manualOverrides };
    if (letter) {
      updatedOverrides[date] = letter;
    } else {
      delete updatedOverrides[date];
    }

    setDistrictConfig({
      ...districtConfig,
      manualOverrides: updatedOverrides,
    });
  };

  const handleOpenOverride = (date?: string) => {
    setOverrideTargetDate(date || todayStr);
    setOverrideModalOpen(true);
  };

  // Sync off-days handler
  const handleUpdateOffDays = (updatedOffDays: OffDay[]) => {
    setDistrictConfig({
      ...districtConfig,
      offDays: updatedOffDays,
    });
  };

  // To-Do list management
  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAddTodo = (newTodo: Omit<ToDoItem, 'id' | 'createdAt'>) => {
    const item: ToDoItem = {
      ...newTodo,
      id: `todo-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [item, ...prev]);
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-900 selection:text-indigo-200">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentLetterDay={calculation.letter}
        isOffDay={calculation.isOffDay}
        schoolName={districtConfig.schoolName}
        onOpenPhotoScanner={() => setPhotoScannerOpen(true)}
        onOpenWelcomeModal={() => setWelcomeModalOpen(true)}
        onOpenShareModal={() => setShareModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Tab 1: Home Dashboard */}
        {activeTab === 'home' && (
          <HomepageView
            currentLetterDay={calculation.letter}
            isOffDay={calculation.isOffDay}
            offDayReason={calculation.offDayReason}
            config={districtConfig}
            periods={periods}
            todos={todos}
            notificationSettings={notificationSettings}
            onToggleTodo={handleToggleTodo}
            onAddTodo={handleAddTodo}
            onOpenOverrideModal={() => handleOpenOverride(todayStr)}
            onOpenPhotoScanner={() => setPhotoScannerOpen(true)}
            onOpenShareModal={() => setShareModalOpen(true)}
            onOpenSyncOffDaysModal={() => setSyncOffDaysModalOpen(true)}
            onNavigateToSchedule={() => setActiveTab('schedule')}
            onNavigateToSceduals={() => setActiveTab('sceduals')}
            onNavigateToTodo={() => setActiveTab('todo')}
          />
        )}

        {/* Tab 2: Sceduals Tab (Tomorrow's schedule and proceeding days after) */}
        {activeTab === 'sceduals' && (
          <SchedulesView
            config={districtConfig}
            periods={periods}
            onOpenShareModal={() => setShareModalOpen(true)}
            onOpenPhotoScanner={() => setPhotoScannerOpen(true)}
            onOpenOverrideModal={(date) => handleOpenOverride(date)}
          />
        )}

        {/* Tab 3: Today's Full Bell Schedule */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <LetterDayBanner
              calculation={calculation}
              config={districtConfig}
              onOpenOverrideModal={() => handleOpenOverride(todayStr)}
              onOpenEngineTab={() => setActiveTab('sceduals')}
            />
            <TodayScheduleView
              currentLetterDay={calculation.letter}
              isOffDay={calculation.isOffDay}
              offDayReason={calculation.offDayReason}
              periods={periods}
              calendarEvents={calendarEvents}
              pendingHomework={[]}
              onOpenPhotoScanner={() => setPhotoScannerOpen(true)}
            />
          </div>
        )}

        {/* Tab 4: To-Do List */}
        {activeTab === 'todo' && (
          <TodoListView
            todos={todos}
            onToggleTodo={handleToggleTodo}
            onAddTodo={handleAddTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        )}

        {/* Tab 5: Settings (Notification toggles, Off-days sync, Cycle controls) */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={notificationSettings}
            onUpdateSettings={setNotificationSettings}
            config={districtConfig}
            onOpenSyncOffDaysModal={() => setSyncOffDaysModalOpen(true)}
            onOpenOverrideModal={() => handleOpenOverride(todayStr)}
          />
        )}
      </main>

      {/* iPhone Floating Bottom Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/80 px-3 py-2 pb-safe flex items-center justify-around shadow-2xl">
        <button
          id="mobile-nav-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'home' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        <button
          id="mobile-nav-sceduals"
          onClick={() => setActiveTab('sceduals')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'sceduals' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Sceduals</span>
        </button>

        <button
          id="mobile-nav-schedule"
          onClick={() => setActiveTab('schedule')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'schedule' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Today</span>
        </button>

        <button
          id="mobile-nav-todo"
          onClick={() => setActiveTab('todo')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'todo' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px] font-semibold">To-Do</span>
        </button>

        <button
          id="mobile-nav-settings"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'settings' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Settings</span>
        </button>
      </div>

      {/* Welcome to Homebase Modal */}
      <WelcomeModal
        isOpen={welcomeModalOpen}
        onClose={handleCloseWelcome}
        onOpenPhotoScanner={handleOpenPhotoScannerFromWelcome}
        currentLetterDay={calculation.letter}
        schoolName={districtConfig.schoolName}
      />

      {/* AI Schedule Photo Scanner Modal */}
      <SchedulePhotoScannerModal
        isOpen={photoScannerOpen}
        onClose={() => setPhotoScannerOpen(false)}
        onApplySchedule={handleApplyImportedPeriods}
        schoolName={districtConfig.schoolName}
      />

      {/* Share Schedule via Messages & Friends Modal */}
      <ShareScheduleModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        periods={periods}
        currentLetterDay={calculation.letter}
        schoolName={districtConfig.schoolName}
      />

      {/* Sync Off Days & Calendar Modal */}
      <SyncOffDaysModal
        isOpen={syncOffDaysModalOpen}
        onClose={() => setSyncOffDaysModalOpen(false)}
        config={districtConfig}
        onUpdateOffDays={handleUpdateOffDays}
      />

      {/* Manual Letter Override Modal */}
      {overrideModalOpen && (
        <LetterDayOverrideModal
          initialDate={overrideTargetDate}
          config={districtConfig}
          onSaveOverride={handleSaveOverride}
          onClose={() => setOverrideModalOpen(false)}
        />
      )}
    </div>
  );
}
