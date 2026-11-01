import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckSquare, Plus, Clock, AlertCircle, ArrowLeft, 
  Trash2, Edit2, Check, Filter, List, CalendarDays, Sparkles, AlertTriangle
} from 'lucide-react';
import { EventItem, TaskItem } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';

interface TimelinePageProps {
  event: EventItem;
  onBack: () => void;
  onProgressUpdate?: (progress: number) => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ event, onBack, onProgressUpdate }) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue' | 'high_priority'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState('Planning');
  const [taskDueDate, setTaskDueDate] = useState(event.event_date || '');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTasks(event.id);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [event.id]);

  const handleToggleTaskStatus = async (task: TaskItem) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const updated = await api.updateTask(event.id, task.id, { status: newStatus });
      setTasks(tasks.map(t => t.id === task.id ? updated : t));
      
      // Update progress
      const completedCount = tasks.filter(t => (t.id === task.id ? newStatus === 'COMPLETED' : t.status === 'COMPLETED')).length;
      const progress = Math.round((completedCount / tasks.length) * 100);
      if (onProgressUpdate) onProgressUpdate(progress);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTaskId) {
        await api.updateTask(event.id, editingTaskId, {
          title: taskTitle,
          description: taskDesc,
          category: taskCategory,
          due_date: taskDueDate,
          priority: taskPriority,
        });
      } else {
        await api.createTask(event.id, {
          title: taskTitle,
          description: taskDesc,
          category: taskCategory,
          due_date: taskDueDate,
          priority: taskPriority,
        });
      }
      setIsModalOpen(false);
      setEditingTaskId(null);
      setTaskTitle('');
      setTaskDesc('');
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.deleteTask(event.id, taskId);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return t.status !== 'COMPLETED';
    if (filter === 'completed') return t.status === 'COMPLETED';
    if (filter === 'overdue') return t.status !== 'COMPLETED' && t.due_date < todayStr;
    if (filter === 'high_priority') return t.priority === 'HIGH' || t.priority === 'URGENT';
    return true;
  });

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const overdueCount = tasks.filter(t => t.status !== 'COMPLETED' && t.due_date < todayStr).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-purple-200 text-slate-600 hover:text-slate-900 hover:bg-purple-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
              Timeline & Task Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Synchronized schedules for {event.event_name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* View mode toggle */}
          <div className="bg-purple-50 p-1 rounded-xl border border-purple-100 flex items-center">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === 'list' ? 'bg-white text-brand-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === 'calendar' ? 'bg-white text-brand-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingTaskId(null);
              setTaskTitle('');
              setTaskDesc('');
              setTaskDueDate(event.event_date || '');
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-soft transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Progress & Overdue Warnings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Milestones Completed</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-bold font-serif text-slate-900">{completedCount}</span>
            <span className="text-xs text-slate-400 font-medium">/ {tasks.length} total tasks</span>
          </div>
          <div className="mt-3 w-full h-2 rounded-full bg-purple-100 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Target Event Date</span>
          <p className="text-2xl font-bold font-serif text-brand-800 mt-1">{event.event_date || 'TBD'}</p>
          <span className="inline-block mt-2 text-[10px] font-semibold text-brand-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
            Main Day
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Overdue Action Items</span>
          <p className={`text-3xl font-bold font-serif mt-1 ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {overdueCount}
          </p>
          <span className={`inline-block mt-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
            overdueCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {overdueCount > 0 ? 'Requires attention' : 'All milestones on schedule'}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {[
          { id: 'all', label: `All Tasks (${tasks.length})` },
          { id: 'pending', label: `Pending (${tasks.length - completedCount})` },
          { id: 'completed', label: `Completed (${completedCount})` },
          { id: 'overdue', label: `Overdue (${overdueCount})` },
          { id: 'high_priority', label: 'High & Urgent Priority' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === tab.id
                ? 'bg-brand-600 text-white shadow-soft font-bold'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-purple-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-soft space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs sm:text-sm">
              No tasks found for the selected filter.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isOverdue = task.status !== 'COMPLETED' && task.due_date < todayStr;
              const isCompleted = task.status === 'COMPLETED';

              const priorityBadges = {
                URGENT: 'bg-rose-50 text-rose-700 border-rose-200',
                HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
                MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
                LOW: 'bg-slate-100 text-slate-600 border-slate-200',
              }[task.priority] || 'bg-purple-50 text-brand-700 border-purple-200';

              return (
                <div
                  key={task.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-200 gap-4 ${
                    isCompleted
                      ? 'bg-slate-50/60 border-slate-200 opacity-70'
                      : isOverdue
                      ? 'bg-rose-50/40 border-rose-200 shadow-xs'
                      : 'bg-[#FAF8FF] border-purple-100 hover:border-brand-300'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <button
                      onClick={() => handleToggleTaskStatus(task)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-purple-300 hover:border-brand-600 bg-white'
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityBadges}`}>
                          {task.priority}
                        </span>
                        <h4 className={`text-sm font-bold text-slate-900 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                          {task.title}
                        </h4>
                        {isOverdue && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                            Overdue
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 self-end sm:self-auto text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      <span>{task.due_date}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setTaskTitle(task.title);
                          setTaskDesc(task.description || '');
                          setTaskCategory(task.category);
                          setTaskDueDate(task.due_date);
                          setTaskPriority(task.priority);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
                        title="Edit task"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
          <div className="border-b border-purple-50 pb-3">
            <h3 className="text-lg font-bold font-serif text-slate-900">Chronological Milestone Schedule</h3>
            <p className="text-xs text-slate-500">Tasks organized by upcoming calendar deadlines</p>
          </div>

          <div className="space-y-6">
            {/* Group by date */}
            {Array.from(new Set(filteredTasks.map(t => t.due_date))).sort().map((dateStr) => {
              const dayTasks = filteredTasks.filter(t => t.due_date === dateStr);
              const isEventDay = dateStr === event.event_date;

              return (
                <div key={dateStr} className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      isEventDay ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-purple-100 text-brand-900'
                    }`}>
                      {dateStr} {isEventDay && '★ EVENT DAY'}
                    </div>
                    <div className="flex-1 h-px bg-purple-100" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                          t.status === 'COMPLETED' ? 'bg-slate-50 border-slate-200 text-slate-500 line-through' : 'bg-[#FAF8FF] border-purple-100'
                        }`}
                      >
                        <span className="font-semibold">{t.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-purple-200 text-brand-700">
                          {t.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE/EDIT TASK MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTaskId ? 'Edit Milestone Task' : 'Add Planning Milestone'}
        subtitle="Schedule deliverables and assign priorities"
      >
        <form onSubmit={handleSaveTask} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g., Finalize floral moodboards & sign contract"
              className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description / Deliverable Specs</label>
            <textarea
              rows={2}
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="Details, vendor names, or specific requirements..."
              className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full p-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (Long Lead Time)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-soft"
            >
              Save Milestone
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

