import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-800">Financial Habit Builder & Wealth Growth Tracker</span>
          <span className="text-slate-400">|</span>
          <span>College Evaluation Capstone Project</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/privacy" className="hover:text-emerald-600 transition">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-emerald-600 transition">Terms & Conditions</Link>
          <Link to="/feedback" className="hover:text-emerald-600 transition">Support & Feedback</Link>
        </div>

        <div>
          <span>&copy; {new Date().getFullYear()} All rights reserved. Secure & Private.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
