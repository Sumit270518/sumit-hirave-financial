import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Bug,
  Lightbulb,
} from 'lucide-react';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export const FeedbackPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    category: 'general',
    title: '',
    description: '',
    priority: 'medium',
  });

  const fetchMyFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.get('/feedback/my');
      if (res.data.success) {
        setSubmissions(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load past submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFeedback();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Please fill in title and description.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/feedback', form);
      if (res.data.success) {
        toast.success('Feedback submitted! Our team reviews every entry.');
        setForm({ category: 'general', title: '', description: '', priority: 'medium' });
        fetchMyFeedback();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Resolved</span>;
      case 'in_review':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">In Review</span>;
      case 'dismissed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending Review</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-600" /> Feedback, Support & Complaints
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Have an idea, spotted a bug, or have a calculation question? Send us a ticket.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Submission Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Submit a New Request
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Feedback Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="general">General Feedback</option>
                <option value="calculation_query">Financial Calculation Question</option>
                <option value="feature_request">Feature Request</option>
                <option value="bug">Bug Report / Glitch</option>
                <option value="complaint">Complaint</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject / Summary *</label>
              <input
                type="text"
                required
                placeholder="Brief summary of your query or suggestion"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="low">Low - General Idea</option>
                <option value="medium">Medium - Standard Request</option>
                <option value="high">High - Urgent / Incorrect Formula</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Detailed Description *</label>
              <textarea
                rows={4}
                required
                placeholder="Provide specific details so our development team can reproduce or address it..."
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>

        {/* Past Submissions & Status Tracking */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Your Past Submissions ({submissions.length})
            </h3>

            {loading ? (
              <LoadingSpinner text="Loading ticket statuses..." />
            ) : submissions.length > 0 ? (
              <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                {submissions.map((sub) => (
                  <div key={sub._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-bold text-slate-900 leading-snug">{sub.title}</h4>
                      {getStatusBadge(sub.status)}
                    </div>

                    <p className="text-slate-600 leading-relaxed mb-2">{sub.description}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">
                      <span className="capitalize">Category: {sub.category.replace('_', ' ')}</span>
                      <span>{formatDate(sub.createdAt)}</span>
                    </div>

                    {/* Admin Public Resolution Notes */}
                    {sub.resolutionNotes && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900">
                        <strong className="block font-bold text-[11px] text-emerald-800 mb-0.5">
                          Admin Resolution Note:
                        </strong>
                        <p className="text-[11px] leading-relaxed text-emerald-900">{sub.resolutionNotes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="No past requests"
                description="Your submitted feedback and admin replies will show up here."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
