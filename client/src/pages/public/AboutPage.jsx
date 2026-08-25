import React from 'react';
import { Shield, Target, Award, Users2, Lock } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
            <Shield className="w-4 h-4" />
            <span>Civic Governance Charter</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About CivicShield Portal
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto">
            A state-of-the-art municipal service management platform designed to eliminate bureaucracy, enforce accountability, and ensure rapid civic issue resolution.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Target className="w-5 h-5 mr-2 text-brand-600" />
            Our Mission & Core Philosophy
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Traditional municipal complaint systems suffer from delayed responses, poor tracking, opaque status updates, and a lack of individual officer accountability. 
            <strong> CivicShield</strong> resolves these bottlenecks by combining modern web architecture, automated SLA deadline monitors, and strict Role-Based Access Control.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Citizen Empowerment</h4>
              <p className="text-xs text-slate-500">Every citizen receives end-to-end tracking, notification alerts, and the power to confirm or reopen complaints.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Department Accountability</h4>
              <p className="text-xs text-slate-500">Every status transition, officer remark, and time duration is logged into an immutable administrative audit trail.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
