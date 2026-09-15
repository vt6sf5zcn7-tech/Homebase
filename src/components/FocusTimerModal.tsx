import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Clock, Sparkles, X } from 'lucide-react';
import { HomeworkAssignment, StudyBlock } from '../types';

interface FocusTimerModalProps {
  assignment: HomeworkAssignment | null;
  studyBlock?: StudyBlock | null;
  onClose: () => void;
  onComplete: (assignmentId: string) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  assignment,
  studyBlock,
  onClose,
  onComplete,
}) => {
  const initialMinutes = studyBlock?.durationMinutes || assignment?.estimatedMinutes || 25;
  const [secondsRemaining, setSecondsRemaining] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSubtasks, setCompletedSubtasks] = useState<number[]>([]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((sec) => sec - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  const toggleSubtask = (idx: number) => {
    if (completedSubtasks.includes(idx)) {
      setCompletedSubtasks(completedSubtasks.filter((i) => i !== idx));
    } else {
      setCompletedSubtasks([...completedSubtasks, idx]);
    }
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progressPercent = Math.round(
    ((initialMinutes * 60 - secondsRemaining) / (initialMinutes * 60)) * 100
  );

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white font-bold text-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {assignment?.subject || 'Focused Study Session'}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
            {assignment?.title || 'Study Session'}
          </h3>
          {studyBlock && (
            <p className="text-xs text-slate-400 font-mono mt-1">
              Slot: {studyBlock.startTime} - {studyBlock.endTime} ({studyBlock.slotType.replace('_', ' ')})
            </p>
          )}
        </div>

        {/* Big Circular Timer Display */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="text-5xl sm:text-6xl font-black font-mono text-white tracking-tight">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="w-full max-w-xs bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden border border-slate-700">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 font-medium mt-1">
            {progressPercent}% completed
          </span>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-colors border border-indigo-400/30"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>{secondsRemaining === initialMinutes * 60 ? 'Start Focus' : 'Resume'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsActive(false);
              setSecondsRemaining(initialMinutes * 60);
            }}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Subtask checklist if available */}
        {assignment?.breakdown && assignment.breakdown.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-850 border border-slate-800 text-xs">
            <div className="font-bold text-slate-200 mb-2">Step-by-Step Breakdown:</div>
            <div className="space-y-1.5">
              {assignment.breakdown.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleSubtask(idx)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer hover:border-indigo-500/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={completedSubtasks.includes(idx)}
                      onChange={() => {}}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span
                      className={
                        completedSubtasks.includes(idx)
                          ? 'line-through text-slate-500'
                          : 'text-slate-200 font-medium'
                      }
                    >
                      {item.subtask}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">{item.minutes}m</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mark Done Button */}
        {assignment && (
          <button
            onClick={() => {
              onComplete(assignment.id);
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mark Assignment Complete</span>
          </button>
        )}
      </div>
    </div>
  );
};
