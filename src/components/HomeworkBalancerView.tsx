import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Filter,
  Flame,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import {
  HomeworkAssignment,
  SchoolPeriod,
  CalendarEvent,
  StudyBlock,
  BalanceScheduleResult,
  LetterDay,
} from '../types';
import {
  requestHomeworkEstimate,
  requestScheduleBalancing,
} from '../services/geminiService';

interface HomeworkBalancerViewProps {
  homework: HomeworkAssignment[];
  periods: SchoolPeriod[];
  calendarEvents: CalendarEvent[];
  currentLetterDay: LetterDay | null;
  onUpdateHomework: (updated: HomeworkAssignment[]) => void;
  onStartFocusSession: (assignment: HomeworkAssignment, studyBlock?: StudyBlock) => void;
  studyBlocks: StudyBlock[];
  onUpdateStudyBlocks: (blocks: StudyBlock[]) => void;
}

export const HomeworkBalancerView: React.FC<HomeworkBalancerViewProps> = ({
  homework,
  periods,
  calendarEvents,
  currentLetterDay,
  onUpdateHomework,
  onStartFocusSession,
  studyBlocks,
  onUpdateStudyBlocks,
}) => {
  // New assignment form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('AP Chemistry');
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [newDescription, setNewDescription] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [isBalancing, setIsBalancing] = useState(false);

  // AI Estimation preview
  const [estimatePreview, setEstimatePreview] = useState<{
    estimatedMinutes: number;
    difficulty: 'Light' | 'Moderate' | 'Challenging' | 'Heavy';
    breakdown: Array<{ subtask: string; minutes: number; description: string }>;
    studyTips: string;
    recommendedSessionType: string;
  } | null>(null);

  // Balance result feedback
  const [balanceResult, setBalanceResult] = useState<BalanceScheduleResult | null>(null);

  // Filter state
  const [filterSubject, setFilterSubject] = useState<string>('all');

  const subjects = Array.from(new Set(homework.map((h) => h.subject)));

  const filteredHomework = homework.filter((h) => {
    if (filterSubject === 'all') return true;
    return h.subject === filterSubject;
  });

  const pendingCount = homework.filter((h) => !h.completed).length;
  const totalMinutesPending = homework
    .filter((h) => !h.completed)
    .reduce((sum, h) => sum + (h.estimatedMinutes || 30), 0);

  const handleToggleComplete = (id: string) => {
    onUpdateHomework(
      homework.map((h) => {
        if (h.id === id) {
          return { ...h, completed: !h.completed };
        }
        return h;
      })
    );
  };

  // Run AI Homework Estimator
  const handleEstimateWithAI = async () => {
    if (!newTitle.trim()) return;
    setIsEstimating(true);
    try {
      const res = await requestHomeworkEstimate({
        title: newTitle,
        subject: newSubject,
        description: newDescription,
        gradeLevel: 'High School',
        targetPace: 'Focused',
      });
      setEstimatePreview(res);
    } catch (err) {
      console.error('Estimation error:', err);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSaveAssignment = () => {
    if (!newTitle.trim()) return;

    const created: HomeworkAssignment = {
      id: `hw-${Date.now()}`,
      title: newTitle,
      subject: newSubject,
      dueDate: newDueDate,
      description: newDescription,
      source: 'manual',
      estimatedMinutes: estimatePreview?.estimatedMinutes || 35,
      difficulty: estimatePreview?.difficulty || 'Moderate',
      completed: false,
      breakdown: estimatePreview?.breakdown,
      aiSuggestedTips: estimatePreview?.studyTips,
    };

    onUpdateHomework([...homework, created]);
    setShowAddModal(false);
    setNewTitle('');
    setNewDescription('');
    setEstimatePreview(null);
  };

  // Run Master AI Schedule Balancer
  const handleBalanceSchedule = async () => {
    setIsBalancing(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const result = await requestScheduleBalancing({
        currentDate: todayStr,
        currentLetterDay: currentLetterDay || 'C',
        pendingHomework: homework.filter((h) => !h.completed),
        schoolSchedule: periods.filter(
          (p) => currentLetterDay && p.daysActive.includes(currentLetterDay)
        ),
        calendarEvents: calendarEvents,
        preferences: {
          latestEndTime: '21:30',
          maxContinuousMinutes: 45,
          useStudyHalls: true,
        },
      });

      setBalanceResult(result);
      if (result.studyBlocks && result.studyBlocks.length > 0) {
        onUpdateStudyBlocks(result.studyBlocks);
      }
    } catch (err) {
      console.error('Balancing error:', err);
    } finally {
      setIsBalancing(false);
    }
  };

  const difficultyBadgeStyles = {
    Light: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Moderate: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Challenging: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    Heavy: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Top Workload Overview & Action Banner */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <BrainCircuit className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                AI Homework & Schedule Balancer
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Estimates realistic assignment completion times with Gemini and automatically schedules study slots into your free periods and after-school routine without conflicting with extracurriculars.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-add-hw"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Assignment
            </button>

            <button
              id="btn-run-balancer"
              onClick={handleBalanceSchedule}
              disabled={isBalancing || pendingCount === 0}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors disabled:opacity-50 border border-indigo-400/30"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isBalancing ? 'animate-spin' : ''}`} />
              {isBalancing ? 'Finding Study Slots...' : '⚡ Balance Schedule with AI'}
            </button>
          </div>
        </div>

        {/* Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Pending Homework</span>
            <div className="text-xl font-black text-white mt-0.5">{pendingCount} tasks</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Estimated Workload</span>
            <div className="text-xl font-black text-indigo-400 mt-0.5">
              ~{Math.round(totalMinutesPending / 60)}h {totalMinutesPending % 60}m
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-400 font-medium">Schedule Feasibility</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {balanceResult?.scheduleFeasibility || 'Optimal (Study Hall Available)'}
            </div>
          </div>
        </div>
      </div>

      {/* AI Balancer Results: Scheduled Study Blocks */}
      {studyBlocks.length > 0 && (
        <div className="bg-slate-900 rounded-2xl border border-indigo-900/60 shadow-xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">
                Recommended Study Slots (Balanced for Day {currentLetterDay || 'C'})
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {studyBlocks.length} slots allocated
            </span>
          </div>

          {balanceResult?.smartSuggestions && (
            <div className="mb-4 p-3.5 bg-indigo-950/50 rounded-xl border border-indigo-800/60 text-xs text-indigo-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-indigo-300">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                AI Schedule Optimization Insights:
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1 text-slate-300">
                {balanceResult.smartSuggestions.map((sug, i) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2.5">
            {studyBlocks.map((block) => {
              const matchedHw = homework.find((h) => h.id === block.assignmentId);

              return (
                <div
                  key={block.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-800 bg-slate-850 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-500/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex flex-col items-center justify-center text-indigo-300 shrink-0">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-bold font-mono">{block.durationMinutes}m</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">
                          {block.assignmentTitle}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 uppercase border border-slate-700">
                          {block.slotType.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5">
                        <span className="font-mono text-indigo-400 font-semibold">
                          {block.startTime} - {block.endTime}
                        </span>
                        <span>•</span>
                        <span>{block.rationale}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (matchedHw) {
                        onStartFocusSession(matchedHw, block);
                      } else {
                        onStartFocusSession(
                          {
                            id: block.assignmentId,
                            title: block.assignmentTitle,
                            subject: block.subject || 'General',
                            dueDate: block.date,
                            source: 'manual',
                            estimatedMinutes: block.durationMinutes,
                            difficulty: 'Moderate',
                            completed: false,
                          },
                          block
                        );
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors self-end sm:self-center shrink-0 border border-indigo-400/30"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Focus Session</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Homework Assignments List */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-lg font-bold text-white">
              Your Homework & Coursework
            </h3>
            <p className="text-xs text-slate-400">
              Synced from Google Classroom To-Do and manual additions with estimated times.
            </p>
          </div>

          {/* Filter dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Subject:</span>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredHomework.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl bg-slate-850 border border-slate-800 text-xs text-slate-400">
            No homework assignments found for this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHomework.map((hw) => {
              const diffStyle = difficultyBadgeStyles[hw.difficulty] || difficultyBadgeStyles.Moderate;

              return (
                <div
                  key={hw.id}
                  id={`hw-item-${hw.id}`}
                  className={`p-4 rounded-xl border transition-all ${
                    hw.completed
                      ? 'bg-slate-850/50 border-slate-800/80 opacity-60'
                      : 'bg-slate-850 border-slate-800 hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(hw.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          hw.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-600 hover:border-indigo-400 bg-slate-800'
                        }`}
                      >
                        {hw.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`text-sm font-bold ${
                              hw.completed
                                ? 'line-through text-slate-500'
                                : 'text-white'
                            }`}
                          >
                            {hw.title}
                          </span>

                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            {hw.subject}
                          </span>

                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${diffStyle}`}
                          >
                            {hw.difficulty}
                          </span>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                            ~{hw.estimatedMinutes} mins
                          </span>

                          {hw.source === 'google_classroom' && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <BookOpen className="w-2.5 h-2.5" />
                              Google Classroom
                            </span>
                          )}
                        </div>

                        {hw.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                            {hw.description}
                          </p>
                        )}

                        {/* Breakdown Subtasks if generated by AI */}
                        {hw.breakdown && hw.breakdown.length > 0 && !hw.completed && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {hw.breakdown.map((b, idx) => (
                              <div
                                key={idx}
                                className="text-[11px] p-2 rounded-lg bg-slate-800 border border-slate-700"
                              >
                                <span className="font-semibold text-slate-200 block">
                                  {b.subtask} ({b.minutes}m)
                                </span>
                                <span className="text-slate-400 text-[10px]">
                                  {b.description}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {hw.aiSuggestedTips && !hw.completed && (
                          <div className="text-[11px] text-indigo-300 bg-indigo-950/40 border border-indigo-800/50 p-2 rounded-lg mt-2 flex items-start gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
                            <span>{hw.aiSuggestedTips}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right action button */}
                    {!hw.completed && (
                      <button
                        onClick={() => onStartFocusSession(hw)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-center"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-200" />
                        <span className="hidden sm:inline">Focus</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Assignment & AI Estimator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">
                  New Assignment & AI Estimator
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Physics Chapter 6 Problem Set #1-15"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. AP Chemistry"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Assignment Description or Instructions
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Paste homework prompt, page numbers, or rubric to get an accurate completion estimate..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              {/* Run AI Estimation button */}
              <button
                type="button"
                onClick={handleEstimateWithAI}
                disabled={isEstimating || !newTitle.trim()}
                className="w-full py-2 px-3 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className={`w-4 h-4 ${isEstimating ? 'animate-spin' : ''}`} />
                {isEstimating ? 'Analyzing Complexity with Gemini...' : 'Estimate Time with Gemini AI'}
              </button>

              {/* Estimation Preview */}
              {estimatePreview && (
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">
                      Estimated Duration:
                    </span>
                    <span className="text-base font-black text-indigo-400">
                      {estimatePreview.estimatedMinutes} minutes
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Difficulty Rating:</span>
                    <span className="font-bold text-slate-200">
                      {estimatePreview.difficulty}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300">
                    <strong>Study Tip:</strong> {estimatePreview.studyTips}
                  </div>

                  {estimatePreview.breakdown && (
                    <div className="pt-2 border-t border-slate-800 space-y-1">
                      <span className="font-bold text-slate-300 block">Subtasks:</span>
                      {estimatePreview.breakdown.map((b, i) => (
                        <div key={i} className="flex justify-between text-[11px] text-slate-400">
                          <span>• {b.subtask}</span>
                          <span className="font-mono font-semibold text-slate-300">{b.minutes}m</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssignment}
                disabled={!newTitle.trim()}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm border border-indigo-400/30"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
