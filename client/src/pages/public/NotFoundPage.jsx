import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Home, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const NotFoundPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mb-4">
        <HelpCircle className="w-8 h-8 text-slate-500" />
      </div>

      <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm mt-2 mb-8">
        The financial page or resource you are looking for does not exist or has been moved.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {user ? (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </Link>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        )}
      </div>
    </div>
  );
};

export default NotFoundPage;
