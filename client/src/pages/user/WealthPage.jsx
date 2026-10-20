import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Plus,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Wallet,
  CreditCard,
  PieChart as PieIcon,
  Calendar,
  Camera,
  Trash2,
  Edit2,
  Info,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const ASSET_CATEGORIES = [
  'Cash',
  'Bank Savings',
  'Fixed Deposits',
  'Investments',
  'Retirement Savings',
  'Property',
  'Gold & Precious Metals',
  'Other Assets',
];

const LIABILITY_CATEGORIES = [
  'Personal Loan',
  'Credit Card Balance',
  'Education Debt',
  'Vehicle Loan',
  'Home Mortgage',
  'Family/Peer Loan',
  'Other Liabilities',
];

const DONUT_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

export const WealthPage = () => {
  const { currency } = useAuth();
  const [summary, setSummary] = useState(null);
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isLiabilityModalOpen, setIsLiabilityModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Forms
  const [assetForm, setAssetForm] = useState({
    name: '',
    category: 'Bank Savings',
    currentValue: '',
    notes: '',
  });

  const [liabilityForm, setLiabilityForm] = useState({
    name: '',
    category: 'Credit Card Balance',
    outstandingAmount: '',
    interestRatePercent: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, assetRes, liabRes, histRes] = await Promise.all([
        api.get('/wealth/summary'),
        api.get('/wealth/assets'),
        api.get('/wealth/liabilities'),
        api.get('/wealth/history'),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (assetRes.data.success) setAssets(assetRes.data.data);
      if (liabRes.data.success) setLiabilities(liabRes.data.data);
      if (histRes.data.success) setHistory(histRes.data.data);
    } catch (error) {
      toast.error('Failed to load wealth analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save Asset
  const handleSaveAsset = async (e) => {
    e.preventDefault();
    if (!assetForm.name || assetForm.currentValue === '') {
      toast.error('Please enter asset name and value.');
      return;
    }

    try {
      if (editingItem) {
        await api.patch(`/wealth/assets/${editingItem._id}`, assetForm);
        toast.success('Asset valuation updated.');
      } else {
        await api.post('/wealth/assets', assetForm);
        toast.success('Asset added to portfolio.');
      }
      setIsAssetModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving asset.');
    }
  };

  // Save Liability
  const handleSaveLiability = async (e) => {
    e.preventDefault();
    if (!liabilityForm.name || liabilityForm.outstandingAmount === '') {
      toast.error('Please enter liability name and balance.');
      return;
    }

    try {
      if (editingItem) {
        await api.patch(`/wealth/liabilities/${editingItem._id}`, liabilityForm);
        toast.success('Liability updated.');
      } else {
        await api.post('/wealth/liabilities', liabilityForm);
        toast.success('Liability recorded.');
      }
      setIsLiabilityModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving liability.');
    }
  };

  // Delete handlers
  const handleDeleteAsset = async (id) => {
    if (!window.confirm('Delete this asset from your portfolio?')) return;
    try {
      await api.delete(`/wealth/assets/${id}`);
      toast.success('Asset deleted.');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete asset.');
    }
  };

  const handleDeleteLiability = async (id) => {
    if (!window.confirm('Remove this liability record?')) return;
    try {
      await api.delete(`/wealth/liabilities/${id}`);
      toast.success('Liability removed.');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete liability.');
    }
  };

  // Capture Snapshot
  const handleCaptureSnapshot = async () => {
    try {
      toast.loading('Capturing net worth valuation snapshot...', { id: 'snap' });
      const res = await api.post('/wealth/snapshot');
      if (res.data.success) {
        toast.success('Dated snapshot captured successfully!', { id: 'snap' });
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to capture snapshot.', { id: 'snap' });
    }
  };

  if (loading && !summary) {
    return <LoadingSpinner text="Calculating net worth metrics..." />;
  }

  const chartHistoryData = history.map((h) => ({
    period: h.dateKey,
    netWorth: h.netWorth,
    assets: h.totalAssets,
    liabilities: h.totalLiabilities,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-5 h-5 text-purple-600" /> Wealth Growth & Net Worth
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Net Worth = Total Assets minus Total Debts. Track valuation changes over time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCaptureSnapshot}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            title="Record dated snapshot for this month"
          >
            <Camera className="w-4 h-4 text-slate-500" />
            Capture Snapshot
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setAssetForm({ name: '', category: 'Bank Savings', currentValue: '', notes: '' });
              setIsAssetModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Add Asset
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setLiabilityForm({ name: '', category: 'Credit Card Balance', outstandingAmount: '', interestRatePercent: '', notes: '' });
              setIsLiabilityModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Add Debt
          </button>
        </div>
      </div>

      {/* Top Net Worth Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Current Net Worth"
          value={formatCurrency(summary?.netWorth, currency)}
          trend={summary?.monthlyNetWorthChange !== 0 ? `${summary?.monthlyNetWorthChange > 0 ? '+' : ''}${formatCurrency(summary?.monthlyNetWorthChange, currency)} MoM` : 'Stable'}
          trendPositive={summary?.monthlyNetWorthChange >= 0}
          subtitle="Assets minus outstanding debts"
          icon={Landmark}
          colorScheme="purple"
        />

        <StatCard
          title="Total Assets"
          value={formatCurrency(summary?.totalAssets, currency)}
          subtitle={`${summary?.assetCount || 0} active asset holdings`}
          icon={Wallet}
          colorScheme="emerald"
        />

        <StatCard
          title="Total Liabilities"
          value={formatCurrency(summary?.totalLiabilities, currency)}
          subtitle={`${summary?.liabilityCount || 0} active debt accounts`}
          icon={CreditCard}
          colorScheme="rose"
        />
      </div>

      {/* Visualizations: Net Worth Trajectory & Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Net Worth Progression Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Historical Net Worth Trajectory</h3>
              <p className="text-xs text-slate-500">Derived exclusively from genuine dated valuation snapshots</p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {chartHistoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="period" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val >= 1000 ? `${val / 1000}k` : val}`} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value, currency), '']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="netWorth" name="Net Worth" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                  <Line type="monotone" dataKey="assets" name="Assets" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="liabilities" name="Liabilities" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No historical snapshots yet" description="Capture month-end snapshots to visualize your net worth curve over time." />
            )}
          </div>
        </div>

        {/* Asset Allocation Donut Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Asset Allocation</h3>
            <p className="text-xs text-slate-500">Capital distribution across asset classes</p>

            <div className="h-48 w-full relative mt-2">
              {summary?.assetAllocation?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.assetAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="amount"
                    >
                      {summary.assetAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(value, currency), 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                  No assets added yet
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 max-h-36 overflow-y-auto">
            {summary?.assetAllocation?.map((item, idx) => (
              <div key={item.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                  />
                  <span className="text-slate-600 truncate max-w-[120px]">{item.category}</span>
                </div>
                <span className="font-semibold text-slate-900">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assets & Liabilities Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Your Assets</h3>
            </div>
            <span className="text-xs font-bold text-emerald-600">
              Total: {formatCurrency(summary?.totalAssets, currency)}
            </span>
          </div>

          {assets.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {assets.map((asset) => (
                <div key={asset._id} className="py-3 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900">{asset.name}</h5>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {asset.category}
                      </span>
                      <span>Valued: {formatDate(asset.valuationDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-emerald-600">
                      {formatCurrency(asset.currentValue, currency)}
                    </span>
                    <button
                      onClick={() => handleDeleteAsset(asset._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No assets logged yet.</p>
          )}
        </div>

        {/* Liabilities List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Your Liabilities & Debts</h3>
            </div>
            <span className="text-xs font-bold text-rose-600">
              Total: {formatCurrency(summary?.totalLiabilities, currency)}
            </span>
          </div>

          {liabilities.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {liabilities.map((liab) => (
                <div key={liab._id} className="py-3 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900">{liab.name}</h5>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {liab.category}
                      </span>
                      {liab.interestRatePercent > 0 && (
                        <span>{liab.interestRatePercent}% APR</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-rose-600">
                      {formatCurrency(liab.outstandingAmount, currency)}
                    </span>
                    <button
                      onClick={() => handleDeleteLiability(liab._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete liability"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No outstanding debts recorded.</p>
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      <Modal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        title={editingItem ? 'Edit Asset' : 'Add Asset Holding'}
      >
        <form onSubmit={handleSaveAsset} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. HDFC Salary Account, Index Fund SIP"
              value={assetForm.name}
              onChange={(e) => setAssetForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Category</label>
              <select
                value={assetForm.category}
                onChange={(e) => setAssetForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {ASSET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Value ({currency}) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="e.g. 50000"
                value={assetForm.currentValue}
                onChange={(e) => setAssetForm((p) => ({ ...p, currentValue: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              placeholder="e.g. Verified balance from mobile banking app"
              value={assetForm.notes}
              onChange={(e) => setAssetForm((p) => ({ ...p, notes: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssetModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              Save Asset
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Liability Modal */}
      <Modal
        isOpen={isLiabilityModalOpen}
        onClose={() => setIsLiabilityModalOpen(false)}
        title={editingItem ? 'Edit Debt Record' : 'Record Liability / Debt'}
      >
        <form onSubmit={handleSaveLiability} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Liability Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. ICICI Credit Card, Student Education Loan"
              value={liabilityForm.name}
              onChange={(e) => setLiabilityForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={liabilityForm.category}
                onChange={(e) => setLiabilityForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {LIABILITY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Outstanding Balance ({currency}) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="e.g. 12000"
                value={liabilityForm.outstandingAmount}
                onChange={(e) => setLiabilityForm((p) => ({ ...p, outstandingAmount: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Interest Rate % (Annual APR)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 8.5"
              value={liabilityForm.interestRatePercent}
              onChange={(e) => setLiabilityForm((p) => ({ ...p, interestRatePercent: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLiabilityModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              Record Debt
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WealthPage;
