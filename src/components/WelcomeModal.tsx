import React from 'react';
import {
  Sparkles,
  Camera,
  CalendarCheck2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  School,
  Clock,
  Smartphone,
  X,
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPhotoScanner: () => void;
  currentLetterDay: string | null;
  schoolName: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onOpenPhotoScanner,
  currentLetterDay,
  schoolName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-auto text-left">
        {/* Top visual banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-950 border-b border-slate-800">
          <button
            id="close-welcome-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 border border-indigo-400/30">
              <School className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                Schreiber High • 11050
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
                Welcome to Homebase
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your high school schedule companion that never gets your letter day wrong. Today is{' '}
            <span className="font-extrabold text-amber-400 underline underline-offset-2">
              Day {currentLetterDay || 'C'}
            </span>
            .
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="p-6 space-y-4">
          {/* Item 1 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                Guaranteed Accurate Letter Days
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                Rotates sequentially across the 6-day cycle (A–F) and pauses on snow days and holidays, keeping your days 100% synchronized with Schreiber High.
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                AI Schedule Photo Scanner
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                Snap a quick photo of your printed schedule or school portal. AI extracts all your periods, rooms, and teachers into your schedule instantly.
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                Sceduals, To-Dos & Messages Sharing
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                Check tomorrow's schedule and proceeding days, share periods with friends via Messages, track tasks, and get morning ID & night Chromebook charging reminders.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 space-y-2.5">
          <button
            id="welcome-scan-photo-btn"
            onClick={() => {
              onClose();
              onOpenPhotoScanner();
            }}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Camera className="w-4 h-4 text-indigo-200" />
            Scan My Schedule Photo
          </button>

          <button
            id="welcome-get-started-btn"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors"
          >
            Continue with Schreiber H.S. (Day {currentLetterDay || 'C'})
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
