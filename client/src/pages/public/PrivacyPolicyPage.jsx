import React from 'react';
import { Lock, Shield } from 'lucide-react';

export const PrivacyPolicyPage = () => {
  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900">Citizen Privacy Policy</h1>
          <p className="text-slate-600 text-sm">Transparent data governance and strict information privacy</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <h3 className="text-base font-bold text-slate-900">1. Information Collection & Purpose</h3>
          <p>
            CivicShield collects user contact details, geolocation coordinates, and uploaded imagery strictly for the legitimate purpose of addressing municipal grievances and dispatching maintenance crews.
          </p>
          <h3 className="text-base font-bold text-slate-900 pt-2">2. Data Security & Storage</h3>
          <p>
            All user sessions are secured with cryptographic JWT authentication and TLS/HTTPS encryption in transit. Passwords are salted with bcrypt. We never sell, share, or monetize citizen data with third-party advertising brokers.
          </p>
          <h3 className="text-base font-bold text-slate-900 pt-2">3. Public Tracking Privacy Isolation</h3>
          <p>
            The public tracking module displays only sanitized progress metrics, timestamps, and general category information without exposing the citizen's legal name, phone number, or private contact details.
          </p>
        </div>
      </div>
    </div>
  );
};
