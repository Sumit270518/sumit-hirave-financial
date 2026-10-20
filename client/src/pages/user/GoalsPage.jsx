import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  History,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit2,
  Clock,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const GOAL_CATEGORIES = [
  'Emergency Fund',
  'Tech & Gadgets',
  'Education',
  'Travel',
  'Vehicle',
  'Home',
  'Investment',
  'Other',
];

export const GoalsPage = () => {
  const { currency } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goalTransactions, setGoalTransactions] = useState([]);

  // Add Goal Form State
  const [goalForm, setGoalForm] = useState({
    name: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    priority: 'medium',
    category: 'Emergency Fund',
  });

  // Contribution/Withdrawal Form State
  const [txForm, setTxForm] = useState({
    type: 'contribution',
    amount: '',
    description: '',
  });

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/goals');
      if (res.data.success) {
        setGoals(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load savings goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!goalForm.name || !goalForm.targetAmount || !goalForm.targetDate) {
      toast.error('Please complete all required fields.');
      return;
    }

    try {
      const res = await api.post('/goals', goalForm);
      if (res.data.success) {
        toast.success('Savings goal established! Every rupee brings you closer.');
        setIsAddModalOpen(false);
        setGoalForm({
          name: '',
          description: '',
          targetAmount: '',
          targetDate: '',
          priority: 'medium',
          category: 'Emergency Fund',
        });
        fetchGoals();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create goal.');
    }
  };

  const handleOpenContribute = (goal, defaultType = 'contribution') => {
    setSelectedGoal(goal);
    setTxForm({
      type: defaultType,
      amount: '',
      description: defaultType === 'contribution' ? 'Monthly savings contribution' : 'Emergency withdrawal',
    });
    setIsContributionModalOpen(true);
  };

  const handleRecordContribution = async (e) => {
    e.preventDefault();
    if (!txForm.amount || Number(txForm.amount) <= 0) {
      toast.error('Enter a valid amount greater than zero.');
      return;
    }

    try {
      const res = await api.post(`/goals/${selectedGoal._id}/contributions`, txForm);
      if (res.data.success) {
        toast.success(res.data.message);
        setIsContributionModalOpen(false);
        fetchGoals();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record contribution.');
    }
  };

  const handleOpenHistory = async (goal) => {
    try {
      setSelectedGoal(goal);
      setIsHistoryModalOpen(true);
      const res = await api.get(`/goals/${goal._id}/history`);
      if (res.data.success) {
        setGoalTransactions(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load contribution history.');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Delete this goal and its entire contribution history?')) return;
    try {
      const res = await api.delete(`/goals/${goalId}`);
      if (res.data.success) {
        toast.success('Goal removed.');
        fetchGoals();
      }
    } catch (error) {
      toast.error('Failed to delete goal.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" /> Savings Goals
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Turn abstract aspirations into tangible, funded milestones.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Create New Goal
        </button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching your savings targets..." />
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const pct = goal.progressPercentage || 0;
            const isCompleted = goal.status === 'completed' || pct >= 100;

            return (
              <div
                key={goal._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {goal.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">{goal.name}</h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenHistory(goal)}
                        title="Contribution history"
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        title="Delete goal"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                      {goal.description}
                    </p>
                  )}

                  {/* Progress Metric Bar */}
                  <div className="space-y-1.5 my-4">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        {formatCurrency(goal.currentAmount, currency)}
                      </span>
                      <span className="font-bold text-emerald-600">{pct}%</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isCompleted ? 'bg-emerald-600' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>Target: {formatCurrency(goal.targetAmount, currency)}</span>
                      <span>Left: {formatCurrency(goal.remainingAmount, currency)}</span>
                    </div>
                  </div>

                  {/* Target Date Indicator */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Target: {formatDate(goal.targetDate)}</span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="font-semibold text-slate-700">
                      {goal.daysRemaining > 0 ? `${goal.daysRemaining} days left` : 'Due / Passed'}
                    </span>
                  </div>
                </div>

                {/* Contribute / Withdraw Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenContribute(goal, 'contribution')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Contribute
                  </button>
                  <button
                    onClick={() => handleOpenContribute(goal, 'withdrawal')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No savings goals yet"
          description="Create your first emergency fund or tech purchase target to start tracking progress."
          actionText="+ Establish Savings Goal"
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Create Goal Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Establish New Savings Goal"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. 6-Month Emergency Buffer"
              value={goalForm.name}
              onChange={(e) => setGoalForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Amount ({currency}) *</label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 50000"
                value={goalForm.targetAmount}
                onChange={(e) => setGoalForm((p) => ({ ...p, targetAmount: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date *</label>
              <input
                type="date"
                required
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm((p) => ({ ...p, targetDate: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={goalForm.category}
                onChange={(e) => setGoalForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {GOAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={goalForm.priority}
                onChange={(e) => setGoalForm((p) => ({ ...p, priority: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Purpose</label>
            <textarea
              rows={2}
              placeholder="Why this goal matters and allocation strategy..."
              value={goalForm.description}
              onChange={(e) => setGoalForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
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
              Create Goal
            </button>
          </div>
        </form>
      </Modal>

      {/* Contribute / Withdraw Modal */}
      <Modal
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
        title={`${txForm.type === 'contribution' ? 'Record Contribution' : 'Record Withdrawal'}: ${selectedGoal?.name || ''}`}
      >
        <form onSubmit={handleRecordContribution} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setTxForm((p) => ({ ...p, type: 'contribution' }))}
              className={`py-2 rounded-lg font-semibold text-xs transition ${
                txForm.type === 'contribution' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Contribution (+)
            </button>
            <button
              type="button"
              onClick={() => setTxForm((p) => ({ ...p, type: 'withdrawal' }))}
              className={`py-2 rounded-lg font-semibold text-xs transition ${
                txForm.type === 'withdrawal' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Withdrawal (-)
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount ({currency}) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              placeholder="e.g. 5000"
              value={txForm.amount}
              onChange={(e) => setTxForm((p) => ({ ...p, amount: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {txForm.type === 'withdrawal' && selectedGoal && (
              <p className="text-[11px] text-slate-500 mt-1">
                Current saved balance available: {formatCurrency(selectedGoal.currentAmount, currency)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Note / Description</label>
            <input
              type="text"
              placeholder="e.g. Salary bonus allocation, transfer from liquid bank"
              value={txForm.description}
              onChange={(e) => setTxForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsContributionModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              Submit Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Goal History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Audit History: ${selectedGoal?.name || ''}`}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span>Target: {formatCurrency(selectedGoal?.targetAmount, currency)}</span>
            <span>Current: {formatCurrency(selectedGoal?.currentAmount, currency)}</span>
          </div>

          {goalTransactions.length > 0 ? (
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
              {goalTransactions.map((tx) => (
                <div key={tx._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {tx.type === 'contribution' ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-rose-600" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-800">{tx.description}</span>
                      <p className="text-slate-400 text-[11px]">{formatDate(tx.date)} &bull; Balance after: {formatCurrency(tx.balanceAfter, currency)}</p>
                    </div>
                  </div>
                  <span
                    className={`font-bold ${
                      tx.type === 'contribution' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {tx.type === 'contribution' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No contributions logged yet.</p>
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

export default GoalsPage;
