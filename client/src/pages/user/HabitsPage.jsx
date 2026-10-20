import React, { useState, useEffect } from 'react';
import {
  Flame,
  CheckCircle2,
  Plus,
  Clock,
  Calendar,
  History,
  RotateCcw,
  Sparkles,
  Award,
  MoreVertical,
  Pause,
  Play,
  Archive,
  Trash2,
  Edit,
} from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const SUGGESTED_HABITS = [
  { name: 'Record expenses daily', freq: 'daily', desc: 'Log cash, UPI, and card purchases every evening.' },
  { name: 'Weekly zero-spending day', freq: 'weekly', desc: 'Designate one day each week with zero discretionary spends.' },
  { name: 'Review budget weekly', freq: 'weekly', desc: 'Audit weekly category totals against monthly targets.' },
  { name: 'Review investments monthly', freq: 'monthly', desc: 'Verify index fund allocation and monthly asset growth.' },
  { name: 'Review month-end wealth progress', freq: 'monthly', desc: 'Capture dated net worth snapshot and debt paydown.' },
];

export const HabitsPage = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('active');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHabitHistory, setSelectedHabitHistory] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    reminderTime: '20:00',
  });

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/habits?status=${filterStatus}`);
      if (res.data.success) {
        setHabits(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load financial habits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [filterStatus]);

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a habit name.');
      return;
    }

    try {
      const res = await api.post('/habits', formData);
      if (res.data.success) {
        toast.success('Financial habit established! Keep the streak alive.');
        setIsAddModalOpen(false);
        setFormData({ name: '', description: '', frequency: 'daily', reminderTime: '20:00' });
        fetchHabits();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create habit.');
    }
  };

  const handleCompleteHabit = async (habitId) => {
    try {
      const res = await api.post(`/habits/${habitId}/completions`);
      if (res.data.success) {
        toast.success(`Completed! Streak: ${res.data.data.currentStreak} 🔥`);
        fetchHabits();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not complete habit.');
    }
  };

  const handleUndoCompletion = async (habitId) => {
    try {
      const res = await api.delete(`/habits/${habitId}/completions`);
      if (res.data.success) {
        toast.success('Habit completion undone.');
        fetchHabits();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not undo completion.');
    }
  };

  const handleOpenHistory = async (habit) => {
    try {
      setSelectedHabitHistory(habit);
      setIsHistoryModalOpen(true);
      const res = await api.get(`/habits/${habit._id}/history`);
      if (res.data.success) {
        setHistoryLogs(res.data.data.completions);
      }
    } catch (error) {
      toast.error('Failed to load completion history.');
    }
  };

  const handleUpdateStatus = async (habitId, newStatus) => {
    try {
      const res = await api.patch(`/habits/${habitId}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Habit marked as ${newStatus}.`);
        fetchHabits();
      }
    } catch (error) {
      toast.error('Failed to update habit status.');
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Delete this habit and all past completion logs?')) return;
    try {
      const res = await api.delete(`/habits/${habitId}`);
      if (res.data.success) {
        toast.success('Habit removed.');
        fetchHabits();
      }
    } catch (error) {
      toast.error('Failed to delete habit.');
    }
  };

  const quickAddSuggested = (suggested) => {
    setFormData({
      name: suggested.name,
      description: suggested.desc,
      frequency: suggested.freq,
      reminderTime: '20:00',
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" /> Financial Habit Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consistency creates compounding results. Build routines that safeguard your future wealth.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            {['active', 'paused', 'archived'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg capitalize transition ${
                  filterStatus === st ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setFormData({ name: '', description: '', frequency: 'daily', reminderTime: '20:00' });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            New Habit
          </button>
        </div>
      </div>

      {/* Suggested Habits Quick-Add Ribbon */}
      <div className="bg-gradient-to-r from-amber-50/60 via-emerald-50/40 to-slate-50 p-4 rounded-2xl border border-amber-200/60 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Recommended Financial Disciplines
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_HABITS.map((s) => (
            <button
              key={s.name}
              onClick={() => quickAddSuggested(s)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200/70 text-slate-800 text-xs font-medium transition shadow-2xs hover:scale-[1.02]"
            >
              <Plus className="w-3 h-3 text-amber-600" />
              <span>{s.name}</span>
              <span className="text-[10px] text-amber-700 font-bold uppercase ml-1">({s.freq})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Habits Grid */}
      {loading ? (
        <LoadingSpinner text="Loading habits and streaks..." />
      ) : habits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {habits.map((habit) => (
            <div
              key={habit._id}
              className={`bg-white rounded-3xl p-5 border transition-all ${
                habit.isCompleted
                  ? 'border-emerald-200 shadow-sm bg-gradient-to-b from-white to-emerald-50/20'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                    <Clock className="w-3 h-3" />
                    {habit.frequency}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">{habit.name}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenHistory(habit)}
                    title="View completion history"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteHabit(habit._id)}
                    title="Delete habit"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {habit.description && (
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                  {habit.description}
                </p>
              )}

              {/* Streaks Card */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100/80 text-amber-600">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Current Streak
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {habit.currentStreak} {habit.frequency === 'daily' ? 'Days' : 'Periods'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Best Streak
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                    <Award className="w-3.5 h-3.5" />
                    {habit.longestStreak}
                  </span>
                </div>
              </div>

              {/* Action Button: Complete or Undo */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Total: {habit.totalCompletions || 0} times
                </span>

                {habit.isCompleted ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Done
                    </span>
                    <button
                      onClick={() => handleUndoCompletion(habit._id)}
                      title="Undo completion"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCompleteHabit(habit._id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition hover:scale-[1.02]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No habits found"
          description="Build daily discipline by tracking mindful spending or savings check-ins."
          actionText="+ Establish First Habit"
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Add Habit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Establish Financial Habit"
      >
        <form onSubmit={handleCreateHabit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Habit Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Record daily expenses before 9 PM"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Rule</label>
            <textarea
              rows={2}
              placeholder="Why this habit matters and specific conditions..."
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cadence / Frequency *</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData((p) => ({ ...p, frequency: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="daily">Daily Habit</option>
                <option value="weekly">Weekly Routine</option>
                <option value="monthly">Monthly Checkpoint</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reminder Time</label>
              <input
                type="time"
                value={formData.reminderTime}
                onChange={(e) => setFormData((p) => ({ ...p, reminderTime: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              Start Habit
            </button>
          </div>
        </form>
      </Modal>

      {/* History Log Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Completion History: ${selectedHabitHistory?.name || ''}`}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span>Cadence: {selectedHabitHistory?.frequency?.toUpperCase()}</span>
            <span>Total Logged: {historyLogs.length}</span>
          </div>

          {historyLogs.length > 0 ? (
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
              {historyLogs.map((log) => (
                <div key={log._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-800">{log.periodKey}</span>
                      {log.notes && <p className="text-slate-400 text-[11px] mt-0.5">{log.notes}</p>}
                    </div>
                  </div>
                  <span className="text-slate-400">{new Date(log.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No historical logs yet.</p>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsHistoryModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HabitsPage;
