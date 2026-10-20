import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-800 mb-4">
            <AlertCircle className="w-8 h-8 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Legal Agreement</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms & Conditions</h1>
          <p className="text-xs text-slate-400 mt-1 mb-8">Effective Date: October 2026 | Educational Platform Terms</p>

          <div className="space-y-8 text-sm text-slate-600 leading-relaxed">
            <section className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-amber-900 text-xs sm:text-sm">
              <strong className="font-semibold block mb-1">Non-Advisory & Educational Disclaimer:</strong>
              Financial Habit Builder & Wealth Growth Tracker is a personal tracking, educational, and habit-formation tool. It does NOT provide certified investment, tax, legal, or financial advice. Projections and simulations are for educational demonstration only and do not guarantee future returns.
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-2">1. Acceptance of Terms</h2>
              <p>
                By registering for, accessing, or using this application, you agree to be bound by these terms. If you do not agree with any portion, you must discontinue use immediately.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-2">2. Accuracy of User Information</h2>
              <p>
                Financial analytics, net worth charts, habit streaks, and goal calculations depend exclusively on the accuracy and regularity of information entered by you. The platform does not directly interface with live bank feeds in Phase 1.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-2">3. Acceptable Use Policy</h2>
              <p>Users agree not to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Attempt unauthorized access to administrative endpoints or other users' private financial data.</li>
                <li>Submit malicious scripts, automated bot queries, or flood request limiters.</li>
                <li>Attempt to manipulate or falsify platform audit logs.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-2">4. Intellectual Property & Academic Rights</h2>
              <p>
                This software was architected and implemented as a capstone project for academic and professional demonstration. All source code, design patterns, and documentation are governed under standard permissive open-source licensing.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
