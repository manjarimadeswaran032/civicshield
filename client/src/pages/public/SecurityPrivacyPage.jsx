import React from 'react';
import { Shield, Lock, Key, Server, UserCheck, CheckCircle2 } from 'lucide-react';

export const SecurityPrivacyPage = () => {
  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <Lock className="w-4 h-4" />
            <span>Cryptographic Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Security Implementation & RBAC Architecture
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto">
            Detailed technical breakdown of HTTPS/TLS encryption, Role-Based Access Control, rate limiting, and zero-trust data protection.
          </p>
        </div>

        {/* 1. HTTPS / TLS Highlight Box */}
        <div className="bg-white p-8 rounded-2xl border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/5 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">HTTPS / TLS Cryptographic Security</h2>
              <p className="text-xs text-emerald-700 font-semibold">Transport Layer Security (Data in Transit Protection)</p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 text-xs sm:text-sm leading-relaxed space-y-2">
            <p>
              <strong>HTTPS/TLS</strong> encrypts data transmitted between the browser and the application server, helping protect credentials, complaint information, location data, and other sensitive information from network interception and tampering while data is in transit.
            </p>
            <p className="text-emerald-800 italic">
              <strong>Note:</strong> HTTPS/TLS protects data in transit and does not by itself encrypt data stored in the database. Data at rest is safeguarded through salted bcrypt password hashing and database-level security controls.
            </p>
          </div>
        </div>

        {/* 2. RBAC Flow Architecture */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <UserCheck className="w-5 h-5 mr-2 text-brand-600" />
            Role-Based Access Control (RBAC) Hierarchy
          </h2>
          <p className="text-sm text-slate-600">
            Authorization is enforced strictly on the backend via middleware. Hidden UI elements alone are never relied upon for security.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-brand-700 uppercase">1. Citizen Role</span>
              <ul className="text-xs text-slate-600 mt-2 space-y-1.5 list-disc list-inside">
                <li>Create complaints with photo and GPS</li>
                <li>View exclusively their own complaints</li>
                <li>Confirm resolution or reopen with rationale</li>
                <li>Strictly denied from officer/admin APIs (403 Forbidden)</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-purple-700 uppercase">2. Municipal Officer Role</span>
              <ul className="text-xs text-slate-600 mt-2 space-y-1.5 list-disc list-inside">
                <li>View assigned & department complaints</li>
                <li>Advance complaint state machine</li>
                <li>Submit resolution proof and remarks</li>
                <li>Denied from administrative role modifications</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-indigo-700 uppercase">3. Department Manager Role</span>
              <ul className="text-xs text-slate-600 mt-2 space-y-1.5 list-disc list-inside">
                <li>Assign and reassign field officers</li>
                <li>Supervise department SLA compliance</li>
                <li>Receive automatic escalation alerts</li>
                <li>Inspect department turnaround analytics</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-900 uppercase">4. System Administrator Role</span>
              <ul className="text-xs text-slate-600 mt-2 space-y-1.5 list-disc list-inside">
                <li>Manage user accounts, roles & permissions</li>
                <li>Configure categories, departments & SLA hours</li>
                <li>Inspect immutable audit logs & security telemetry</li>
                <li>Export audit reports in CSV format</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Defense-in-Depth Layer Summary */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Server className="w-5 h-5 mr-2 text-brand-600" />
            Full-Stack Defense-in-Depth Security Matrix
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-slate-600">
            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Password Security (Bcrypt):</strong> 12 salt rounds; plain-text passwords are never logged or stored.
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Brute-Force Rate Limiting:</strong> Auth endpoints throttled to 20 attempts per 15 minutes with automated IP logging.
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Helmet.js Security Headers:</strong> Disables X-Powered-By, sets CSP policies, blocks MIME sniffing.
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Secure Upload Sanitization:</strong> Multer MIME-type validation (JPEG, PNG, WebP only) and randomized UUID filenames.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
