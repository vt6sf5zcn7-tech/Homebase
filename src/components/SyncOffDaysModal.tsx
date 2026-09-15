import React, { useState } from 'react';
import {
  Calendar,
  X,
  Plus,
  Trash2,
  Check,
  Sparkles,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { DistrictConfig, OffDay } from '../types';
import { formatFriendlyDate, getTodayDateStr } from '../services/letterDayEngine';

interface SyncOffDaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DistrictConfig;
  onUpdateOffDays: (offDays: OffDay[]) => void;
}

export const SyncOffDaysModal: React.FC<SyncOffDaysModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateOffDays,
}) => {
  const [offDays, setOffDays] = useState<OffDay[]>(config.offDays || []);
  const [newDate, setNewDate] = useState<string>(getTodayDateStr());
  const [newName, setNewName] = useState<string>('');
  const [newType, setNewType] = useState<OffDay['type']>('holiday');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddOffDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newName.trim()) return;

    const existingIdx = offDays.findIndex((od) => od.date === newDate);
    let updated: OffDay[];
    if (existingIdx >= 0) {
      updated = [...offDays];
      updated[existingIdx] = {
        date: newDate,
        name: newName.trim(),
        type: newType,
        pausesCycle: true,
      };
    } else {
      updated = [
        ...offDays,
        {
          date: newDate,
          name: newName.trim(),
          type: newType,
          pausesCycle: true,
        },
      ].sort((a, b) => a.date.localeCompare(b.date));
    }

    setOffDays(updated);
    onUpdateOffDays(updated);
    setNewName('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDelete = (date: string) => {
    const updated = offDays.filter((od) => od.date !== date);
    setOffDays(updated);
    onUpdateOffDays(updated);
  };

  // Sync Schreiber High defaults
  const handleRestoreDefaults = () => {
    const defaultList: OffDay[] = [
      { date: '2026-09-07', name: 'Labor Day (No School)', type: 'holiday', pausesCycle: true },
      { date: '2026-09-14', name: 'Rosh Hashanah (No School)', type: 'holiday', pausesCycle: true },
      { date: '2026-09-23', name: 'Yom Kippur (No School)', type: 'holiday', pausesCycle: true },
      { date: '2026-10-12', name: 'Columbus Day / Indigenous Peoples Day', type: 'holiday', pausesCycle: true },
      { date: '2026-11-03', name: 'Superintendent Conference Day (Staff Only)', type: 'pd_day', pausesCycle: true },
      { date: '2026-11-11', name: 'Veterans Day Observed', type: 'holiday', pausesCycle: true },
      { date: '2026-11-26', name: 'Thanksgiving Recess', type: 'break', pausesCycle: true },
      { date: '2026-11-27', name: 'Thanksgiving Recess', type: 'break', pausesCycle: true },
      { date: '2026-12-24', name: 'Winter Recess Begins', type: 'break', pausesCycle: true },
      { date: '2027-01-18', name: 'Dr. Martin Luther King Jr. Day', type: 'holiday', pausesCycle: true },
      { date: '2027-02-15', name: 'Presidents Day / Mid-Winter Recess', type: 'break', pausesCycle: true },
    ];
    setOffDays(defaultList);
    onUpdateOffDays(defaultList);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-auto text-left flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950/80 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                School Calendar Sync
              </span>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                School Off-Days & Holidays
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Off-days automatically halt the 6-day cycle so Day C, D, E, etc. stay 100% accurate and don't get shifted by holidays or snow days.
          </p>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Calendar updated successfully!</span>
            </div>
          )}

          {/* Add Off Day Form */}
          <form onSubmit={handleAddOffDay} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 block">Add or Log an Off-Day / Snow Day</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="holiday">Holiday (No School)</option>
                  <option value="weather">Snow / Weather Closure</option>
                  <option value="pd_day">Superintendent Conference Day</option>
                  <option value="break">Recess / Break</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Reason / Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Snow Day - School Closed"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Pauses cycle: Yes (Letter advances only on school days)
              </span>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
              >
                + Add Off-Day
              </button>
            </div>
          </form>

          {/* Current List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Synced Off-Days ({offDays.length})</span>
              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="text-indigo-400 hover:underline text-[11px]"
              >
                Sync Schreiber Official Calendar
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {offDays.map((od) => (
                <div
                  key={od.date}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-white block truncate">{od.name}</span>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span>{formatFriendlyDate(od.date)}</span>
                      <span className="text-slate-600">•</span>
                      <span className="capitalize">{od.type.replace('_', ' ')}</span>
                      <span className="text-emerald-400 font-semibold">• Pauses Cycle</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(od.date)}
                    className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
