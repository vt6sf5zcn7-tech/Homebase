import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Tag,
  AlertCircle,
  Calendar,
  Sparkles,
  Check,
  Smartphone,
  ShieldAlert,
  BatteryCharging,
} from 'lucide-react';
import { ToDoItem } from '../types';
import { getTodayDateStr, formatFriendlyDate, offsetDateStr } from '../services/letterDayEngine';

interface TodoListViewProps {
  todos: ToDoItem[];
  onToggleTodo: (id: string) => void;
  onAddTodo: (todo: Omit<ToDoItem, 'id' | 'createdAt'>) => void;
  onDeleteTodo: (id: string) => void;
}

export const TodoListView: React.FC<TodoListViewProps> = ({
  todos,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // New Todo Form State
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'School' | 'Personal' | 'Clubs' | 'Urgent'>('School');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [dueDate, setDueDate] = useState<string>(getTodayDateStr());
  const [notes, setNotes] = useState('');

  const categories = ['All', 'School', 'Urgent', 'Personal', 'Clubs'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTodo({
      title: title.trim(),
      category,
      priority,
      dueDate,
      notes: notes.trim() || undefined,
      completed: false,
    });

    setTitle('');
    setNotes('');
    setIsAdding(false);
  };

  // Quick Preset Adders
  const handleQuickAddIdReminder = () => {
    onAddTodo({
      title: 'Wear school ID badge around neck',
      category: 'Urgent',
      priority: 'high',
      dueDate: getTodayDateStr(),
      notes: 'Schreiber security check at main lobby entrance.',
      completed: false,
    });
  };

  const handleQuickAddChromebook = () => {
    onAddTodo({
      title: 'Charge Chromebook to 100% overnight',
      category: 'School',
      priority: 'high',
      dueDate: offsetDateStr(getTodayDateStr(), 1),
      notes: 'Plug in before going to sleep.',
      completed: false,
    });
  };

  const filteredTodos = todos.filter((item) => {
    if (filter === 'active' && item.completed) return false;
    if (filter === 'completed' && !item.completed) return false;
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = todos.length - completedCount;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 px-2 pb-16 text-left">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
              Task Checklist
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            To-Do List
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Keep track of what you need for school today, upcoming projects, and reminders.
          </p>
        </div>

        <button
          id="open-add-todo-btn"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-900/30 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Add New Task'}</span>
        </button>
      </div>

      {/* 2. Fast Quick Add Banner (School ID & Chromebook) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleQuickAddIdReminder}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors block">
              + Quick Add: School ID Badge
            </span>
            <span className="text-[11px] text-slate-500">
              Morning reminder for Schreiber High entrance
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={handleQuickAddChromebook}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <BatteryCharging className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors block">
              + Quick Add: Charge Chromebook
            </span>
            <span className="text-[11px] text-slate-500">
              Night before charging reminder
            </span>
          </div>
        </button>
      </div>

      {/* 3. Add Task Accordion */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-xl space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Create a Task
            </h3>
            <span className="text-[11px] text-slate-500">Schreiber Student Planner</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bring scientific calculator for Math P3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="School">School</option>
                <option value="Urgent">Urgent</option>
                <option value="Personal">Personal</option>
                <option value="Clubs">Clubs</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="Additional details, locker number, or book to pack..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
            >
              Save To-Do
            </button>
          </div>
        </form>
      )}

      {/* 4. Filter & Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-1 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium ${
              filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            All ({todos.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-2.5 py-1 rounded-lg font-medium ${
              filter === 'active' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-2.5 py-1 rounded-lg font-medium ${
              filter === 'completed' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Done ({completedCount})
          </button>
        </div>
      </div>

      {/* 5. To-Do Items List */}
      <div className="space-y-2.5">
        {filteredTodos.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">All caught up!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              No tasks currently in this view. Enjoy your day or add new reminders above.
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const isDone = todo.completed;

            return (
              <div
                key={todo.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isDone
                    ? 'bg-slate-950/40 border-slate-900 opacity-60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => onToggleTodo(todo.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold tracking-tight ${
                        isDone ? 'line-through text-slate-500' : 'text-white'
                      }`}
                    >
                      {todo.title}
                    </p>

                    {todo.notes && (
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {todo.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          todo.category === 'Urgent'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : todo.category === 'School'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {todo.category}
                      </span>

                      {todo.dueDate && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {formatFriendlyDate(todo.dueDate)}
                        </span>
                      )}

                      {todo.priority === 'high' && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                          High
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTodo(todo.id)}
                  className="text-slate-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
