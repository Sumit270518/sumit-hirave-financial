import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Activity,
  MessageSquare,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  FileText,
  UserCheck,
  UserX,
  History,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'feedback' | 'audit'
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Feedback State
  const [feedbackList, setFeedbackList] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    status: 'in_review',
    resolutionNotes: '',
    internalNotes: '',
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Load Overview Stats
  const fetchAdminStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load administrative analytics.');
    } finally {
      setLoadingStats(false);
    }
  };

  // Load Users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const params = new URLSearchParams();
      if (userSearch) params.append('search', userSearch);
      if (userStatusFilter) params.append('status', userStatusFilter);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch user directory.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load Feedback
  const fetchAllFeedback = async () => {
    try {
      setLoadingFeedback(true);
      const res = await api.get('/admin/feedback');
      if (res.data.success) {
        setFeedbackList(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load feedback queue.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  // Load Audit Logs
  const fetchAuditLogs = async () => {
    try {
      setLoadingAudit(true);
      const res = await api.get('/admin/audit-logs');
      if (res.data.success) {
        setAuditLogs(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load audit trail.');
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'feedback') fetchAllFeedback();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab, userStatusFilter]);

  // Suspend / Reactivate User
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const confirmMsg = `Are you sure you want to ${newStatus === 'suspended' ? 'SUSPEND' : 'REACTIVATE'} this user?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.patch(`/admin/users/${userId}/status`, {
        status: newStatus,
        reason: 'Administrative action taken via management console',
      });
      if (res.data.success) {
        toast.success(`User ${newStatus === 'suspended' ? 'suspended' : 'reactivated'}.`);
        fetchUsers();
        fetchAdminStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status.');
    }
  };

  // Open Feedback Modal
  const handleOpenFeedbackModal = (fb) => {
    setSelectedFeedback(fb);
    setFeedbackForm({
      status: fb.status || 'in_review',
      resolutionNotes: fb.resolutionNotes || '',
      internalNotes: fb.internalNotes || '',
    });
    setFeedbackModalOpen(true);
  };

  // Save Feedback Resolution
  const handleSaveFeedback = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/admin/feedback/${selectedFeedback._id}`, feedbackForm);
      if (res.data.success) {
        toast.success('Feedback ticket updated.');
        setFeedbackModalOpen(false);
        fetchAllFeedback();
        fetchAdminStats();
      }
    } catch (error) {
      toast.error('Failed to update ticket.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          {[
            { id: 'overview', label: 'Platform Overview', icon: Activity },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'feedback', label: 'Feedback & Tickets', icon: MessageSquare },
            { id: 'audit', label: 'Security Audit Logs', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Admin Operational Mode</span>
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {loadingStats ? (
            <LoadingSpinner text="Aggregating platform metrics..." />
          ) : (
            <>
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800">
                  <span className="text-xs font-semibold uppercase text-slate-400 block">Total Registered Users</span>
                  <h3 className="text-3xl font-extrabold text-white mt-2">{stats?.users?.total || 0}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                    <span className="text-emerald-400 font-bold">{stats?.users?.active || 0} Active</span>
                    <span>&bull;</span>
                    <span className="text-rose-400 font-bold">{stats?.users?.suspended || 0} Suspended</span>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800">
                  <span className="text-xs font-semibold uppercase text-slate-400 block">Total Financial Records</span>
                  <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
                    {stats?.records?.totalFinancialRecords || 0}
                  </h3>
                  <span className="text-xs text-slate-400 mt-2 block">
                    {stats?.records?.transactions || 0} Incomes & Expenses logged
                  </span>
                </div>

                <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800">
                  <span className="text-xs font-semibold uppercase text-slate-400 block">Habits & Disciplines</span>
                  <h3 className="text-3xl font-extrabold text-amber-400 mt-2">{stats?.records?.habits || 0}</h3>
                  <span className="text-xs text-slate-400 mt-2 block">
                    {stats?.records?.completions || 0} total verified completions
                  </span>
                </div>

                <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800">
                  <span className="text-xs font-semibold uppercase text-slate-400 block">Savings Goals Established</span>
                  <h3 className="text-3xl font-extrabold text-purple-400 mt-2">{stats?.records?.goals || 0}</h3>
                  <span className="text-xs text-slate-400 mt-2 block">
                    {stats?.feedback?.pending || 0} pending support inquiries
                  </span>
                </div>
              </div>

              {/* Registration Trend Chart */}
              <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800">
                <h3 className="text-base font-bold text-white mb-1">New User Signups by Month</h3>
                <p className="text-xs text-slate-400 mb-4">Registration progression over recent months</p>

                <div className="h-64 w-full">
                  {stats?.registrationTrend?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.registrationTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis dataKey="period" tickLine={false} axisLine={{ stroke: '#334155' }} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <YAxis tickLine={false} axisLine={{ stroke: '#334155' }} tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                        />
                        <Bar dataKey="count" name="New Users" fill="#a855f7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-slate-500">
                      No trend data available yet
                    </div>
                  )}
                </div>
              </div>

              {/* Privacy Notice Card */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold mb-0.5">Privacy By Default:</strong>
                  Individual user salaries, transaction descriptions, asset holdings, and private balances are NOT exposed in administrative consoles to maintain user confidentiality. Only platform health and support requests are viewable.
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= TAB 2: USER MANAGEMENT ================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="suspended">Suspended Accounts</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            {loadingUsers ? (
              <LoadingSpinner text="Querying user directory..." />
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-900/50 transition">
                        <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                        <td className="py-3 px-4 text-slate-400">{u.email}</td>
                        <td className="py-3 px-4 text-slate-400">{formatDate(u.createdAt)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              u.status === 'active'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleUserStatus(u._id, u.status)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                              u.status === 'active'
                                ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800'
                                : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No users found" description="No users match the search criteria." />
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: FEEDBACK & TICKETS ================= */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            {loadingFeedback ? (
              <LoadingSpinner text="Loading tickets..." />
            ) : feedbackList.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {feedbackList.map((fb) => (
                  <div key={fb._id} className="p-4 hover:bg-slate-900/40 transition flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-purple-300 border border-slate-700">
                          {fb.category}
                        </span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs text-slate-400">From: {fb.user?.name || fb.userEmail}</span>
                        <span className="text-xs text-slate-400">({formatDate(fb.createdAt)})</span>
                      </div>

                      <h4 className="text-sm font-bold text-white">{fb.title}</h4>
                      <p className="text-xs text-slate-300 max-w-2xl">{fb.description}</p>

                      {fb.resolutionNotes && (
                        <div className="mt-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800 p-2 rounded-lg">
                          <strong>Public Resolution Note:</strong> {fb.resolutionNotes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          fb.status === 'resolved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {fb.status}
                      </span>
                      <button
                        onClick={() => handleOpenFeedbackModal(fb)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Respond & Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No tickets in queue" description="All user feedback and complaints have been addressed." />
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: AUDIT LOGS ================= */}
      {activeTab === 'audit' && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
          {loadingAudit ? (
            <LoadingSpinner text="Fetching security audit logs..." />
          ) : auditLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Resource</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400">{formatDateTime(log.timestamp)}</td>
                      <td className="py-3 px-4 font-semibold text-purple-300">{log.actorEmail || 'System'}</td>
                      <td className="py-3 px-4 font-bold text-white">{log.action}</td>
                      <td className="py-3 px-4 text-slate-400">{log.resourceType}</td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-400">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No audit entries" description="Privileged actions will be logged here." />
          )}
        </div>
      )}

      {/* Feedback Resolution Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title={`Respond to Ticket: ${selectedFeedback?.title || ''}`}
      >
        <form onSubmit={handleSaveFeedback} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Update Status</label>
            <select
              value={feedbackForm.status}
              onChange={(e) => setFeedbackForm((p) => ({ ...p, status: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Public Resolution Notes <span className="text-emerald-600">(Visible to the User)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Explain how the issue was fixed or answer the financial calculation query..."
              value={feedbackForm.resolutionNotes}
              onChange={(e) => setFeedbackForm((p) => ({ ...p, resolutionNotes: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Internal Admin Notes <span className="text-slate-400">(Strictly Private / Never sent to User)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Internal technical notes, database checks, or developer remarks..."
              value={feedbackForm.internalNotes}
              onChange={(e) => setFeedbackForm((p) => ({ ...p, internalNotes: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setFeedbackModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition"
            >
              Save Resolution
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
