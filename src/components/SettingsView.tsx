import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  ShieldCheck,
  BatteryCharging,
  Clock,
  Volume2,
  VolumeX,
  Smartphone,
  Calendar,
  Sparkles,
  Check,
  AlertCircle,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { NotificationSettings, DistrictConfig } from '../types';

interface SettingsViewProps {
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
  config: DistrictConfig;
  onOpenSyncOffDaysModal: () => void;
  onOpenOverrideModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  config,
  onOpenSyncOffDaysModal,
  onOpenOverrideModal,
}) => {
  const [testAlertSent, setTestAlertSent] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const toggleMaster = () => {
    onUpdateSettings({
      ...settings,
      enabled: !settings.enabled,
    });
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleTimeChange = (key: 'morningReminderTime' | 'nightReminderTime', val: string) => {
    onUpdateSettings({
      ...settings,
      [key]: val,
    });
  };

  // Trigger test push notification
  const triggerTestNotification = (title: string, body: string) => {
    if (!settings.enabled) {
      setTestAlertSent('Notifications are currently disabled. Turn them on above first.');
      setTimeout(() => setTestAlertSent(null), 3000);
      return;
    }

    // Try native HTML5 notification if supported
    if (typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          setPermissionState(perm);
          if (perm === 'granted') {
            new Notification(title, { body });
          }
        });
      }
    }

    setTestAlertSent(`Simulated Alert Delivered: "${title}"`);
    setTimeout(() => setTestAlertSent(null), 4000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 px-2 pb-16 text-left">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
              Preferences & Alerts
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Settings & Notifications
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure school ID reminders, Chromebook charging notifications, sound, and calendar sync.
          </p>
        </div>
      </div>

      {testAlertSent && (
        <div className="p-4 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{testAlertSent}</span>
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
        </div>
      )}

      {/* 2. Master Toggle Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              settings.enabled
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            {settings.enabled ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-black text-white">
              App Notifications
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {settings.enabled
                ? 'Notifications are active. You will receive timely morning and evening prompts.'
                : 'All notifications are muted. No alerts will be sent to your device.'}
            </p>
          </div>
        </div>

        {/* Big Switch */}
        <button
          id="master-notification-toggle"
          type="button"
          onClick={toggleMaster}
          className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
            settings.enabled ? 'bg-indigo-600' : 'bg-slate-800'
          }`}
        >
          <div
            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
              settings.enabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 3. Detailed Notification Controls */}
      <div
        className={`rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5 transition-opacity ${
          settings.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
        }`}
      >
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            Daily Reminders
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated alerts scheduled around your school routine.
          </p>
        </div>

        {/* Morning School ID */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Morning School ID Reminder
                </span>
                <span className="px-2 py-0.2 rounded-md bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/20">
                  Schreiber Security
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                "Don’t forget to wear your school ID the morning of!"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <input
              type="time"
              value={settings.morningReminderTime}
              onChange={(e) => handleTimeChange('morningReminderTime', e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono"
            />

            <button
              onClick={() => handleToggle('morningSchoolIdReminder')}
              className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                settings.morningSchoolIdReminder ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                  settings.morningSchoolIdReminder ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>

            <button
              onClick={() =>
                triggerTestNotification(
                  'Wear School ID Badge',
                  'Don’t forget to wear your school ID before heading out to Schreiber High!'
                )
              }
              title="Test Alert"
              className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20"
            >
              Test
            </button>
          </div>
        </div>

        {/* Night Chromebook Charging */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <BatteryCharging className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Night Chromebook Charging Reminder
                </span>
                <span className="px-2 py-0.2 rounded-md bg-blue-500/10 text-blue-300 text-[10px] font-bold border border-blue-500/20">
                  Night Before
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                "Don’t forget to charge your Chromebook the night before the day!"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <input
              type="time"
              value={settings.nightReminderTime}
              onChange={(e) => handleTimeChange('nightReminderTime', e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono"
            />

            <button
              onClick={() => handleToggle('nightChromebookReminder')}
              className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                settings.nightChromebookReminder ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                  settings.nightChromebookReminder ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>

            <button
              onClick={() =>
                triggerTestNotification(
                  'Charge Your Chromebook',
                  'Don’t forget to charge your Chromebook the night before the day!'
                )
              }
              title="Test Alert"
              className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20"
            >
              Test
            </button>
          </div>
        </div>

        {/* Off Day & Cycle Alert */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                Off-Day & Schedule Cycle Alerts
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Notify when an upcoming day is an off day (holiday, conference day, weather break).
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggle('offDayAlerts')}
            className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors shrink-0 ${
              settings.offDayAlerts ? 'bg-indigo-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                settings.offDayAlerts ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Sound Toggle */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                Notification Sound & Haptics
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Play subtle chime sound when reminders trigger.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggle('soundEnabled')}
            className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors shrink-0 ${
              settings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4. Calendar & Off Days Quick Actions */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">
          District Cycle & Off-Day Synchronization
        </h3>
        <p className="text-xs text-slate-400">
          Currently configured for {config.schoolName}. All off-days pause the letter cycle automatically.
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={onOpenSyncOffDaysModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Manage & Sync Off Days ({config.offDays?.length || 0})</span>
          </button>

          <button
            onClick={onOpenOverrideModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Override Letter Day (Set Day A-F)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
