import React from 'react';
import { Phone, Mail, MapPin, HelpCircle, Clock, Shield } from 'lucide-react';

export const ContactHelpPage = () => {
  const faqs = [
    { q: 'How do I know my complaint is being worked on?', a: 'Every complaint status update is logged with officer remarks in your citizen dashboard. You also receive in-app notifications whenever status changes.' },
    { q: 'What happens if a complaint is not resolved in time?', a: 'CivicShield has an automated background SLA escalation engine. If a complaint is overdue, it is automatically marked Overdue and escalated to the Department Operations Manager.' },
    { q: 'Can an officer close a complaint without my approval?', a: 'No. When an officer resolves an issue, it enters "Resolved / Awaiting Confirmation". The citizen must either confirm resolution or reopen with a reason.' }
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
            <HelpCircle className="w-4 h-4" />
            <span>Support & Municipal Contacts</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contact & Help Center</h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">Get assistance with municipal services, technical support, or emergency helplines.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Emergency Hotline</h3>
            <p className="text-xs text-slate-600">Toll-Free: 1800-CIVIC-SHIELD</p>
            <p className="text-[10px] text-emerald-600 font-semibold">Available 24 Hours / 7 Days</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Email Support</h3>
            <p className="text-xs text-slate-600">grievances@civicshield.gov</p>
            <p className="text-[10px] text-slate-400">Response within 4 hours</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Command Center</h3>
            <p className="text-xs text-slate-600">Civic Tower, Municipal Zone 1</p>
            <p className="text-[10px] text-slate-400">Mon-Sat: 8:00 AM - 8:00 PM</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h2>
          <div className="divide-y divide-slate-100 space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="pt-4 first:pt-0">
                <h4 className="text-sm font-bold text-slate-900 mb-1">{faq.q}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
