import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  User,
  Layers,
  Edit2,
  Trash2,
  RefreshCw,
  FileImage,
  ArrowRight,
  FileText,
  Smile,
  Plus,
  Info,
  Check,
} from 'lucide-react';
import { SchoolPeriod, LetterDay } from '../types';
import {
  parseScheduleFromPhoto,
  parseScheduleFromText,
  ParsedPeriodFromPhoto,
} from '../services/geminiService';
import {
  getSubjectEmoji,
  getSubjectCategory,
  SUBJECT_EMOJIS_LIST,
  SubjectEmojiOption,
} from '../utils/subjectEmoji';

interface SchedulePhotoScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySchedule: (newPeriods: SchoolPeriod[]) => void;
  currentSchoolName: string;
}

export const SchedulePhotoScannerModal: React.FC<SchedulePhotoScannerModalProps> = ({
  isOpen,
  onClose,
  onApplySchedule,
  currentSchoolName,
}) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'text'>('photo');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [rawScheduleText, setRawScheduleText] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepMessage, setScanStepMessage] = useState<string>('Initializing AI scanner...');
  const [scanError, setScanError] = useState<string | null>(null);
  const [parsedPeriods, setParsedPeriods] = useState<ParsedPeriodFromPhoto[] | null>(null);
  const [detectedSchool, setDetectedSchool] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [confidenceNotes, setConfidenceNotes] = useState<string | null>(null);

  // Emoji picker modal/popover state
  const [activeEmojiPickerIdx, setActiveEmojiPickerIdx] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mime = file.type || 'image/jpeg';
    setSelectedMimeType(mime);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setParsedPeriods(null);
      setScanError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUseSampleSchedule = () => {
    // Generate a high-contrast mockup schedule image canvas for instant testing
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Dark background card
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 800, 1000);

      // Header banner
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(40, 40, 720, 110);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(40, 40, 720, 110);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('PAUL D. SCHREIBER HIGH SCHOOL', 70, 85);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText('Student Schedule 2026-2027 • Cycle: A B C D E F', 70, 115);

      const sampleRows = [
        { p: '1', name: 'AP Chemistry', emoji: '🧪', rm: 'Sci-304', t: 'Dr. Martinez', time: '08:05 - 08:51', days: 'A B C D E F' },
        { p: '2', name: 'Honors Pre-Calculus', emoji: '📐', rm: 'Math-214', t: 'Mr. Vance', time: '08:55 - 09:45', days: 'A B C D E F' },
        { p: '3', name: 'AP US History', emoji: '🏛️', rm: 'Soc-108', t: 'Ms. Callahan', time: '09:49 - 10:35', days: 'A B C D E F' },
        { p: '4', name: 'Spanish III Honors', emoji: '🇪🇸', rm: 'Lang-115', t: 'Sra. Gomez', time: '10:39 - 11:25', days: 'A B C D E F' },
        { p: '5', name: 'Study Hall / Library', emoji: '📖', rm: 'Lib-101', t: 'Faculty', time: '11:29 - 12:15', days: 'A B C D E F' },
        { p: '6', name: 'Student Lunch & Commons', emoji: '🥪', rm: 'Cafeteria', t: 'Staff', time: '12:19 - 13:05', days: 'A B C D E F' },
        { p: '7', name: 'English 11 Honors', emoji: '📚', rm: 'Eng-202', t: 'Mrs. Gable', time: '13:09 - 13:55', days: 'A B C D E F' },
        { p: '8', name: 'Physical Education / Health', emoji: '🏃', rm: 'Gym-A', t: 'Coach Miller', time: '13:59 - 14:45', days: 'A C E' },
        { p: '9', name: 'Robotics & CAD Engineering', emoji: '🤖', rm: 'Lab-102', t: 'Mr. Henderson', time: '14:49 - 15:05', days: 'B D F' },
      ];

      sampleRows.forEach((row, i) => {
        const y = 180 + i * 85;
        ctx.fillStyle = i % 2 === 0 ? '#1e293b' : '#0f172a';
        ctx.fillRect(40, y, 720, 75);
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(40, y, 720, 75);

        ctx.fillStyle = '#6366f1';
        ctx.fillRect(40, y, 8, 75);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(`P${row.p}: ${row.emoji} ${row.name}`, 65, y + 32);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px sans-serif';
        ctx.fillText(`Room: ${row.rm}  |  Teacher: ${row.t}`, 65, y + 58);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '14px sans-serif';
        ctx.fillText(`${row.time}  [${row.days}]`, 560, y + 45);
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setSelectedImage(dataUrl);
      setSelectedMimeType('image/jpeg');
      setParsedPeriods(null);
      setScanError(null);
    }
  };

  const handleStartScan = async () => {
    setIsScanning(true);
    setScanError(null);
    setScanStepMessage('Uploading to Gemini AI Vision engine...');

    const timer1 = setTimeout(() => setScanStepMessage('Extracting OCR text & period rows...'), 1200);
    const timer2 = setTimeout(() => setScanStepMessage('Classifying subjects & tagging emojis...'), 2400);

    try {
      let result;
      if (activeTab === 'photo') {
        if (!selectedImage) {
          throw new Error('Please select or capture a schedule photo first.');
        }
        result = await parseScheduleFromPhoto(
          selectedImage,
          selectedMimeType,
          currentSchoolName
        );
      } else {
        if (!rawScheduleText.trim()) {
          throw new Error('Please paste your schedule text or type your classes first.');
        }
        result = await parseScheduleFromText(
          rawScheduleText,
          currentSchoolName
        );
      }

      if (!result.periods || result.periods.length === 0) {
        throw new Error('Could not identify class periods. Please make sure the schedule table is clearly visible or paste the full text.');
      }

      // Ensure every period has an emoji and subject category
      const enhanced = result.periods.map((p) => ({
        ...p,
        emoji: p.emoji || getSubjectEmoji(p.name, p.isStudyHall),
        subjectCategory: p.subjectCategory || getSubjectCategory(p.name),
      }));

      setParsedPeriods(enhanced);
      setDetectedSchool(result.detectedSchoolName || currentSchoolName);
      setStudentName(result.studentName || null);
      setConfidenceNotes(result.confidenceNotes || 'Schedule parsed and subject emojis assigned successfully.');
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(err.message || 'Failed to parse schedule. Try a clearer image or paste text directly.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsScanning(false);
    }
  };

  // Update a field in a parsed period
  const handleUpdatePeriod = (index: number, field: keyof ParsedPeriodFromPhoto, value: any) => {
    if (!parsedPeriods) return;
    const updated = [...parsedPeriods];
    updated[index] = { ...updated[index], [field]: value };
    // If name changed and no manual emoji, auto update emoji
    if (field === 'name') {
      updated[index].emoji = getSubjectEmoji(value as string, updated[index].isStudyHall);
      updated[index].subjectCategory = getSubjectCategory(value as string);
    }
    setParsedPeriods(updated);
  };

  // Toggle letter day for a period
  const handleToggleLetterDay = (periodIdx: number, letter: string) => {
    if (!parsedPeriods) return;
    const updated = [...parsedPeriods];
    const currentDays = updated[periodIdx].daysActive || [];
    if (currentDays.includes(letter)) {
      updated[periodIdx].daysActive = currentDays.filter((d) => d !== letter);
    } else {
      updated[periodIdx].daysActive = [...currentDays, letter];
    }
    setParsedPeriods(updated);
  };

  // Select all days
  const handleSetAllDays = (periodIdx: number) => {
    if (!parsedPeriods) return;
    const updated = [...parsedPeriods];
    updated[periodIdx].daysActive = ['A', 'B', 'C', 'D', 'E', 'F'];
    setParsedPeriods(updated);
  };

  // Add empty period
  const handleAddPeriod = () => {
    if (!parsedPeriods) return;
    const nextNum = parsedPeriods.length + 1;
    const newP: ParsedPeriodFromPhoto = {
      periodNumber: nextNum,
      name: `Period ${nextNum} Elective`,
      room: 'Room --',
      teacher: 'Staff',
      startTime: '08:00',
      endTime: '08:50',
      daysActive: ['A', 'B', 'C', 'D', 'E', 'F'],
      isStudyHall: false,
      emoji: '⚡',
      subjectCategory: 'Elective',
      color: '#6366F1',
    };
    setParsedPeriods([...parsedPeriods, newP]);
  };

  // Remove period
  const handleDeletePeriod = (index: number) => {
    if (!parsedPeriods) return;
    const updated = parsedPeriods.filter((_, i) => i !== index);
    setParsedPeriods(updated);
  };

  const handleApply = () => {
    if (!parsedPeriods) return;

    const formatted: SchoolPeriod[] = parsedPeriods.map((p, idx) => {
      const days = (p.daysActive && p.daysActive.length > 0)
        ? (p.daysActive.map((d) => d.toUpperCase()) as LetterDay[])
        : (['A', 'B', 'C', 'D', 'E', 'F'] as LetterDay[]);

      return {
        id: `p-${idx + 1}-${Date.now()}`,
        periodNumber: p.periodNumber || idx + 1,
        name: p.name || `Period ${idx + 1}`,
        room: p.room || 'TBD',
        teacher: p.teacher || 'Staff',
        color: p.color || (idx % 2 === 0 ? '#3B82F6' : '#8B5CF6'),
        startTime: p.startTime || '08:00',
        endTime: p.endTime || '08:50',
        daysActive: days,
        isStudyHall: p.isStudyHall ?? p.name.toLowerCase().includes('study'),
        emoji: p.emoji || getSubjectEmoji(p.name, p.isStudyHall),
        subjectCategory: p.subjectCategory || getSubjectCategory(p.name),
      };
    });

    onApplySchedule(formatted);
    onClose();
  };

  const letterDaysList = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Smart Schedule Scanner
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Gemini 3.8 AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auto-extracts periods, rooms, bell times, and assigns subject emojis
              </p>
            </div>
          </div>
          <button
            id="close-scanner-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {/* Top Mode Tabs (when not reviewing) */}
          {!parsedPeriods && (
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('photo')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'photo'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Photo / Camera Scan</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'text'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Paste Portal / Text</span>
              </button>
            </div>
          )}

          {/* Step 1A: Photo Mode */}
          {!parsedPeriods && activeTab === 'photo' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedImage ? (
                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-3xl p-6 sm:p-8 text-center transition-all bg-slate-950/40">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/80 mx-auto flex items-center justify-center text-indigo-400 mb-4 border border-slate-700 shadow-inner">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                    Upload or Snap Your Bell Schedule
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
                    Take a photo of your paper schedule or upload a screenshot from Genesis, PowerSchool, Infinite Campus, or StudentVUE.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      id="upload-file-btn"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      Choose Photo / File
                    </button>

                    <button
                      id="camera-snap-btn"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-all"
                    >
                      <Camera className="w-4 h-4 text-emerald-400" />
                      Take Photo (iPhone)
                    </button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center">
                    <button
                      id="use-sample-schedule-btn"
                      onClick={handleUseSampleSchedule}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 underline underline-offset-4"
                    >
                      <FileImage className="w-3.5 h-3.5" />
                      Don't have a schedule handy? Try sample Schreiber H.S. schedule
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image Preview with Scanning Animation */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-80 flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="Schedule to scan"
                      className="w-full h-full object-contain max-h-80"
                    />

                    {/* Laser scanning line if isScanning */}
                    {isScanning && (
                      <div className="absolute inset-0 bg-indigo-950/40 pointer-events-none flex flex-col justify-between">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#38bdf8] animate-bounce" />
                        <div className="text-center py-3 bg-slate-900/90 backdrop-blur-md border-t border-slate-800">
                          <span className="text-xs font-semibold text-cyan-400 flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                            {scanStepMessage}
                          </span>
                        </div>
                      </div>
                    )}

                    {!isScanning && (
                      <button
                        id="change-photo-btn"
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 transition-colors shadow-lg"
                      >
                        Change Photo
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      id="retake-schedule-btn"
                      onClick={() => setSelectedImage(null)}
                      disabled={isScanning}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      id="run-ai-scan-btn"
                      onClick={handleStartScan}
                      disabled={isScanning}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Scanning with Gemini AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Extract Schedule & Subject Emojis</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1B: Paste Text Mode */}
          {!parsedPeriods && activeTab === 'text' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    Paste Schedule Text (from Genesis / PowerSchool / Email)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRawScheduleText(
                        `Period 1: AP Chemistry - Room Sci-304 - Dr. Martinez (Days A-E)
Period 2: Homeroom & AP US History - Room Hum-108 - Ms. Ross (Days A,B,D,E,F)
Period 3: Honors Pre-Calculus - Room Math-210 - Mr. Larson (Days A-C, E, F)
Period 4: Spanish III Honors - Room ModLang-202 - Sra. Gomez (Days B-F)
Period 5: Study Hall (Free Period) - Library Media Ctr - Mr. Henderson (Days A-F)
Period 6: Lunch & Student Commons - Cafeteria - Faculty (Days A-F)
Period 7: AP English Literature - Room Lang-115 - Mrs. Howard (Days A, C-F)
Period 8: Intro to Engineering & CAD - Tech-101 - Mr. Alvarez (Days A-D, F)
Period 9: Extra Help & Advisory / Clubs - Campus Center (Days A-F)`
                      );
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline"
                  >
                    Fill sample text
                  </button>
                </div>

                <textarea
                  value={rawScheduleText}
                  onChange={(e) => setRawScheduleText(e.target.value)}
                  placeholder="Example:
Period 1: AP Chemistry (Room 304, Dr. Martinez) 8:05-8:51
Period 2: AP US History (Room 108, Ms. Ross) 8:55-9:45
Period 3: Honors Pre-Calculus (Room 210) 9:49-10:35..."
                  rows={8}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700/80 p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />

                <p className="text-[11px] text-slate-400">
                  Gemini will parse your course titles, identify study halls and lunch, automatically assign high school bell times, and tag cool subject emojis.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleStartScan}
                  disabled={isScanning || !rawScheduleText.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Parsing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Parse Schedule & Assign Emojis</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error notice */}
          {scanError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-semibold">Scanner notice</p>
                <p>{scanError}</p>
              </div>
            </div>
          )}

          {/* Step 2: Parsed Result Review with Subject Emojis & Interactive Visuals */}
          {parsedPeriods && (
            <div className="space-y-4">
              {/* Success Banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">Schedule Analyzed: </span>
                    <span>{parsedPeriods.length} periods extracted with subject emojis</span>
                    {detectedSchool && <span> • {detectedSchool}</span>}
                  </div>
                </div>
                <button
                  id="re-scan-btn"
                  onClick={() => {
                    setParsedPeriods(null);
                    setSelectedImage(null);
                    setRawScheduleText('');
                  }}
                  className="text-xs text-emerald-400 hover:underline font-semibold"
                >
                  Scan Another
                </button>
              </div>

              {/* Instructions Callout */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px]">
                <Info className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                <span>
                  <strong>Tip:</strong> Tap on any emoji (e.g. 🧪, 📐, 📚) to customize it, or edit class details and day toggles below before saving.
                </span>
              </div>

              {/* Periods List */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                {parsedPeriods.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5 relative"
                  >
                    {/* Top Row: Emoji, Period number, Course title, Study hall tag, Delete */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* Interactive Subject Emoji Button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveEmojiPickerIdx(
                                activeEmojiPickerIdx === idx ? null : idx
                              )
                            }
                            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-lg flex items-center justify-center transition-all hover:scale-105 shadow-xs"
                            title="Click to change subject emoji"
                          >
                            <span>{p.emoji || '📘'}</span>
                          </button>

                          {/* Quick Emoji Picker Popover */}
                          {activeEmojiPickerIdx === idx && (
                            <div className="absolute top-11 left-0 z-30 w-64 p-2.5 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-2 text-left animate-in fade-in zoom-in-95 duration-150">
                              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                                <span className="text-[11px] font-bold text-slate-300">
                                  Select Subject Emoji
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActiveEmojiPickerIdx(null)}
                                  className="text-slate-400 hover:text-white text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto p-1">
                                {SUBJECT_EMOJIS_LIST.map((opt) => (
                                  <button
                                    key={opt.emoji}
                                    type="button"
                                    onClick={() => {
                                      handleUpdatePeriod(idx, 'emoji', opt.emoji);
                                      handleUpdatePeriod(idx, 'subjectCategory', opt.category);
                                      setActiveEmojiPickerIdx(null);
                                    }}
                                    title={`${opt.name} (${opt.category})`}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-base hover:bg-indigo-600/30 hover:scale-110 transition-transform ${
                                      p.emoji === opt.emoji ? 'bg-indigo-600/40 ring-1 ring-indigo-400' : 'bg-slate-800'
                                    }`}
                                  >
                                    {opt.emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Period Number Badge */}
                        <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 border border-indigo-500/30">
                          P{p.periodNumber}
                        </span>

                        {/* Editable Class Title */}
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handleUpdatePeriod(idx, 'name', e.target.value)}
                          className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-0"
                          placeholder="Class title (e.g. AP Chemistry)"
                        />
                      </div>

                      {/* Study Hall Toggle & Delete */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdatePeriod(idx, 'isStudyHall', !p.isStudyHall)}
                          className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-colors ${
                            p.isStudyHall
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {p.isStudyHall ? 'Free / Study' : 'Class'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePeriod(idx)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Middle Row: Room, Teacher, Times */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 bg-slate-900/60 rounded-lg px-2 py-1 border border-slate-800">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <input
                          type="text"
                          value={p.room || ''}
                          onChange={(e) => handleUpdatePeriod(idx, 'room', e.target.value)}
                          placeholder="Room (e.g. Sci-304)"
                          className="w-full bg-transparent text-slate-300 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-900/60 rounded-lg px-2 py-1 border border-slate-800">
                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                        <input
                          type="text"
                          value={p.teacher || ''}
                          onChange={(e) => handleUpdatePeriod(idx, 'teacher', e.target.value)}
                          placeholder="Teacher (e.g. Dr. Martinez)"
                          className="w-full bg-transparent text-slate-300 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-900/60 rounded-lg px-2 py-1 border border-slate-800">
                        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                        <input
                          type="text"
                          value={p.startTime}
                          onChange={(e) => handleUpdatePeriod(idx, 'startTime', e.target.value)}
                          placeholder="08:05"
                          className="w-12 bg-transparent text-slate-300 text-xs font-mono focus:outline-none"
                        />
                        <span className="text-slate-500">-</span>
                        <input
                          type="text"
                          value={p.endTime}
                          onChange={(e) => handleUpdatePeriod(idx, 'endTime', e.target.value)}
                          placeholder="08:51"
                          className="w-12 bg-transparent text-slate-300 text-xs font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Bottom Row: Active Letter Day Toggles */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-slate-400 mr-1">
                          Meets on Days:
                        </span>
                        {letterDaysList.map((letter) => {
                          const isActive = p.daysActive?.includes(letter);
                          return (
                            <button
                              key={letter}
                              type="button"
                              onClick={() => handleToggleLetterDay(idx, letter)}
                              className={`w-5 h-5 rounded-md text-[10px] font-bold transition-all ${
                                isActive
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {letter}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSetAllDays(idx)}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        All Days (A-F)
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Period Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleAddPeriod}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Add Class Period</span>
                </button>

                <span className="text-xs text-slate-400">
                  {parsedPeriods.length} total periods
                </span>
              </div>

              {/* Bottom Save / Apply Bar */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  id="cancel-parsed-btn"
                  onClick={() => setParsedPeriods(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Back
                </button>
                <button
                  id="apply-scanned-schedule-btn"
                  onClick={handleApply}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Save to My Schedule</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
