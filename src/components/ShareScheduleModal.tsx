import React, { useState } from 'react';
import {
  MessageSquare,
  Share2,
  Copy,
  Check,
  X,
  Users,
  Send,
  Calendar,
  Clock,
  Sparkles,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { SchoolPeriod, LetterDay } from '../types';

interface ShareScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  periods: SchoolPeriod[];
  currentLetterDay: LetterDay | null;
  schoolName: string;
}

export const ShareScheduleModal: React.FC<ShareScheduleModalProps> = ({
  isOpen,
  onClose,
  periods,
  currentLetterDay,
  schoolName,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedDay, setSelectedDay] = useState<LetterDay | 'ALL'>(currentLetterDay || 'C');
  const [recipientName, setRecipientName] = useState('');
  const [customNote, setCustomNote] = useState('Here is my Schreiber High schedule! When do we have lunch / free periods together?');

  if (!isOpen) return null;

  // Periods for the selected day or all
  const filteredPeriods = selectedDay === 'ALL'
    ? periods
    : periods.filter((p) => p.daysActive?.includes(selectedDay));

  // Generate clean message text
  const generateShareMessage = () => {
    let text = `📚 My Schreiber Schedule (${selectedDay === 'ALL' ? 'Full Cycle' : `Day ${selectedDay}`})\n`;
    text += `${schoolName}\n\n`;

    filteredPeriods.forEach((p) => {
      text += `• P${p.periodNumber} (${p.startTime}-${p.endTime}): ${p.name}`;
      if (p.room) text += ` [Rm ${p.room}]`;
      if (p.isStudyHall) text += ` (Free/Study)`;
      text += `\n`;
    });

    if (customNote.trim()) {
      text += `\n💬 Note: ${customNote.trim()}\n`;
    }

    text += `\n✨ Synced via Homebase 11050`;
    return text;
  };

  const messageText = generateShareMessage();

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Open in iMessage / SMS
  const handleSendViaMessages = () => {
    // encodeURIComponent for sms: or mailto:
    const encodedBody = encodeURIComponent(messageText);
    const smsUrl = `sms:&body=${encodedBody}`;
    window.location.href = smsUrl;
  };

  // Native Web Share API if supported
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Schedule - ${schoolName}`,
          text: messageText,
        });
      } catch (err) {
        // User cancelled or not supported
      }
    } else {
      handleCopy();
    }
  };

  const days: (LetterDay | 'ALL')[] = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-auto text-left flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border-b border-slate-800 relative">
          <button
            id="close-share-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-900/40 border border-emerald-400/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                iMessage & SMS Sharing
              </span>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                Share Schedule with Friends
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Send your class schedule directly to friends via Messages or copy a formatted summary to coordinate free periods and lunch.
          </p>
        </div>

        {/* Body Options */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* 1. Day Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Select Schedule to Share
            </label>
            <div className="flex flex-wrap gap-1.5">
              {days.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedDay === day
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {day === 'ALL' ? 'Full 9-Period Schedule' : `Day ${day}`}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Custom Note */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Add Personal Note (Optional)
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Free Period 5 in the library, text me!"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 3. Message Preview Box (Apple Messages Style) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-300">Message Preview</span>
              <span className="text-[11px] text-slate-500">Ready for Messages</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto selection:bg-indigo-800">
              {messageText}
            </div>
          </div>

          {/* 4. Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              id="sync-to-messages-btn"
              onClick={handleSendViaMessages}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send via Messages (SMS)</span>
            </button>

            <button
              id="copy-schedule-text-btn"
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-900/30 transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Schedule Text</span>
                </>
              )}
            </button>
          </div>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Share via AirDrop, WhatsApp, or Instagram</span>
            </button>
          )}

          {/* Tips */}
          <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-900/50 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-indigo-300/90 leading-relaxed">
              <strong>Tip:</strong> Send this to your friend group chat so everyone knows who has Period 5 or 9 free periods, lunch tables, and study halls together!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
