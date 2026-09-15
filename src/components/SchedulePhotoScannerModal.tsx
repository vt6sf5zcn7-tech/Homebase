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
  Calendar,
  Layers,
  Edit2,
  Trash2,
  RefreshCw,
  FileImage,
  ArrowRight,
} from 'lucide-react';
import { SchoolPeriod, LetterDay } from '../types';
import { parseScheduleFromPhoto, ParsedPeriodFromPhoto } from '../services/geminiService';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [parsedPeriods, setParsedPeriods] = useState<ParsedPeriodFromPhoto[] | null>(null);
  const [detectedSchool, setDetectedSchool] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [confidenceNotes, setConfidenceNotes] = useState<string | null>(null);

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
        { p: '1', name: 'AP Chemistry', rm: 'Sci-304', t: 'Dr. Martinez', time: '08:05 - 08:51', days: 'A B C D E F' },
        { p: '2', name: 'Honors Pre-Calculus', rm: 'Math-214', t: 'Mr. Vance', time: '08:55 - 09:45', days: 'A B C D E F' },
        { p: '3', name: 'AP US History', rm: 'Soc-108', t: 'Ms. Callahan', time: '09:49 - 10:35', days: 'A B C D E F' },
        { p: '4', name: 'Study Hall / Library', rm: 'Lib-101', t: 'Faculty', time: '10:39 - 11:25', days: 'A B C D E F' },
        { p: '5', name: 'Student Lunch', rm: 'Cafeteria', t: 'Staff', time: '11:29 - 12:15', days: 'A B C D E F' },
        { p: '6', name: 'English 11 Honors', rm: 'Eng-202', t: 'Mrs. Gable', time: '12:19 - 13:05', days: 'A B C D E F' },
        { p: '7', name: 'Spanish III', rm: 'Lang-115', t: 'Sra. Ortiz', time: '13:09 - 13:55', days: 'A B C D E F' },
        { p: '8', name: 'Physical Education / Health', rm: 'Gym-A', t: 'Coach Miller', time: '13:59 - 14:45', days: 'A C E' },
        { p: '9', name: 'Robotics Engineering', rm: 'Lab-102', t: 'Mr. Henderson', time: '14:49 - 15:05', days: 'B D F' },
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
        ctx.fillText(`Period ${row.p}: ${row.name}`, 65, y + 32);

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
    if (!selectedImage) return;

    setIsScanning(true);
    setScanError(null);

    try {
      const result = await parseScheduleFromPhoto(
        selectedImage,
        selectedMimeType,
        currentSchoolName
      );

      if (!result.periods || result.periods.length === 0) {
        throw new Error('Could not identify class periods in the image. Please make sure the schedule table is clearly visible.');
      }

      setParsedPeriods(result.periods);
      setDetectedSchool(result.detectedSchoolName || currentSchoolName);
      setStudentName(result.studentName || null);
      setConfidenceNotes(result.confidenceNotes || 'Schedule extracted successfully.');
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(err.message || 'Failed to parse schedule image.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleApply = () => {
    if (!parsedPeriods) return;

    const formatted: SchoolPeriod[] = parsedPeriods.map((p, idx) => {
      // Validate or fallback letter days
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
      };
    });

    onApplySchedule(formatted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Scan Schedule Photo
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Vision
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Snap or upload your bell schedule, portal screenshot, or paper printout
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
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {/* Step 1: Upload or capture */}
          {!parsedPeriods && (
            <div className="space-y-4">
              {/* Hidden file inputs */}
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
                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-6 sm:p-8 text-center transition-all bg-slate-950/40">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/80 mx-auto flex items-center justify-center text-indigo-400 mb-4 border border-slate-700">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    Upload Your Class Schedule
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                    Take a photo of your paper schedule, or upload a screenshot from Genesis, PowerSchool, or Infinite Campus.
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
                      Don't have a photo? Try with sample Schreiber H.S. schedule
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image Preview with Scanning Animation */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-72 flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="Schedule to scan"
                      className="w-full h-full object-contain max-h-72"
                    />

                    {/* Laser scanning line if isScanning */}
                    {isScanning && (
                      <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none flex flex-col justify-between">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-pulse" />
                        <div className="text-center py-2 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800">
                          <span className="text-xs font-semibold text-cyan-400 flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 animate-spin text-cyan-300" />
                            Gemini AI reading periods, rooms, and rotation days...
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
                          Analyzing Schedule Image...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          Extract Schedule with AI
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
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

          {/* Step 2: Parsed Result Review */}
          {parsedPeriods && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">Schedule Extracted: </span>
                    <span>{parsedPeriods.length} periods detected</span>
                    {detectedSchool && <span> • {detectedSchool}</span>}
                  </div>
                </div>
                <button
                  id="re-scan-btn"
                  onClick={() => {
                    setParsedPeriods(null);
                    setSelectedImage(null);
                  }}
                  className="text-xs text-emerald-400 hover:underline font-semibold"
                >
                  Scan Another
                </button>
              </div>

              {confidenceNotes && (
                <p className="text-xs text-slate-400 italic px-1">
                  "{confidenceNotes}"
                </p>
              )}

              {/* Periods List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {parsedPeriods.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center">
                        P{p.periodNumber}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                          {p.name}
                          {p.isStudyHall && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Study Hall
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {p.room || 'Room --'}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-500" />
                            {p.teacher || 'Staff'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {p.startTime} - {p.endTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {p.daysActive && p.daysActive.length > 0 && (
                        <div className="flex items-center gap-0.5">
                          {p.daysActive.map((day, dIdx) => (
                            <span
                              key={dIdx}
                              className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 flex items-center justify-center"
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Apply Bar */}
              <div className="pt-2 flex items-center justify-end gap-3">
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
                  Save to My Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
