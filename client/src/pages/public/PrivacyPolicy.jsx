import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { ShieldCheck, Lock, EyeOff, FileText } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600 mb-4">
            <ShieldCheck className="w-8 h-8" />
            <span className="text-xs font-bold uppercase tracking-wider">Privacy & Security Commitment</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400 mt-1 mb-8">Last Updated: October 2026 | Capstone Project Compliance</p>

          <div className="space-y-8 text-sm text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" /> 1. Data Ownership & Sensitivity
              </h2>
              <p>
                Financial Habit Builder & Wealth Growth Tracker treats all personal financial entries—including income amounts, expenses, savings targets, assets, and liabilities—as strictly confidential. You retain full ownership of all data submitted through your account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-emerald-600" /> 2. Administrative Privacy Shield
              </h2>
              <p>
                Platform administrators do not have access to individual transaction descriptions, specific salary receipts, or private expense breakdowns. Administrative dashboards present only aggregated, anonymous statistical indicators (such as total registrations and system activity) required for platform operation and maintenance.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> 3. Data Collection & Usage
              </h2>
              <p>We collect only the information strictly required for core functionality:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Account identity: Name, normalized email address, and bcrypt-hashed passwords.</li>
                <li>Financial tracking data: User-entered transactions, custom financial habits, goal targets, and asset/liability valuations.</li>
                <li>Technical logs: Safe request timestamps and IP metadata logged for operational security and audit tracking.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-2">4. No Third-Party Data Sharing</h2>
              <p>
                We do not sell, rent, monetize, or disclose your financial records to advertising networks, credit bureaus, or external financial brokers. All calculations are executed directly within your authenticated session.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-2">5. Data Retention & Deletion Rights</h2>
              <p>
                You may request account deletion at any time. Upon deletion, all associated transactions, habits, savings goals, assets, liabilities, and net worth snapshots are permanently purged from the active database.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
