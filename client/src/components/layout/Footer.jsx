import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, CheckCircle2, Phone, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold text-white">CivicShield</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Secure Civic Complaint and Municipal Service Management Portal engineered for transparency, accountability, and real-time civic problem resolution.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg w-fit">
              <Lock className="w-3.5 h-3.5" />
              <span>TLS/HTTPS End-to-End Encrypted</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Public Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-white transition">Portal Home</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition">How CivicShield Works</Link></li>
              <li><Link to="/track" className="hover:text-white transition">Public Complaint Tracker</Link></li>
              <li><Link to="/security" className="hover:text-white transition">Security Architecture & RBAC</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About Municipal Mission</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Compliance & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/privacy" className="hover:text-white transition">Citizen Privacy Policy</Link></li>
              <li><Link to="/accessibility" className="hover:text-white transition">WCAG 2.1 Accessibility</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Municipal Helpline & Desk</Link></li>
              <li><span className="text-slate-500">Immutable Audit Logging Active</span></li>
              <li><span className="text-slate-500">Automated SLA Escalation Engine</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Emergency Helplines</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-brand-400" />
                <span>Municipal Toll-Free: 1800-CIVIC-SHIELD</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-brand-400" />
                <span>grievances@civicshield.gov</span>
              </li>
              <li className="pt-2">
                <span className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-slate-800 text-slate-300 rounded border border-slate-700">
                  Municipal Command Center 24/7
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 CivicShield Municipal Service Portal. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Engineered with Role-Based Access Control & Strict Data Isolation</p>
        </div>
      </div>
    </footer>
  );
};
