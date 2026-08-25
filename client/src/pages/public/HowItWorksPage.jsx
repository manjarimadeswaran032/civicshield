import React from 'react';
import { FilePlus, Eye, UserCheck, Wrench, CheckCircle, RotateCcw } from 'lucide-react';

export const HowItWorksPage = () => {
  const steps = [
    { num: '01', title: 'Citizen Reports Grievance', desc: 'Citizen submits complaint with photographic evidence, GPS location coordinates, and category priority.', icon: FilePlus, color: 'bg-blue-600' },
    { num: '02', title: 'Department Intake & Review', desc: 'Department managers screen the issue, verify category jurisdiction, and calculate target resolution SLA.', icon: Eye, color: 'bg-indigo-600' },
    { num: '03', title: 'Field Officer Assigned', desc: 'Designated field officer receives real-time assignment notification with task specifics and SLA deadline.', icon: UserCheck, color: 'bg-purple-600' },
    { num: '04', title: 'On-Site Repair in Progress', desc: 'Municipal work crews perform physical maintenance and update the system with internal progress remarks.', icon: Wrench, color: 'bg-amber-600' },
    { num: '05', title: 'Resolution & Proof Submission', desc: 'Officer marks complaint as Resolved, attaching corrective action remarks and photographic proof.', icon: CheckCircle, color: 'bg-emerald-600' },
    { num: '06', title: 'Citizen Verification or Reopening', desc: 'Citizen inspects resolution, rates service satisfaction (1-5 stars), or reopens with a reason if unsatisfied.', icon: RotateCcw, color: 'bg-rose-600' }
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider">
            6-Stage Complaint Lifecycle
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How CivicShield Works
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            From citizen submission to verified on-ground repair, every step is transparent and tracked.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className={`w-12 h-12 rounded-xl ${step.color} text-white flex items-center justify-center font-extrabold text-lg shrink-0 shadow-md`}>
                {step.num}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <step.icon className="w-4 h-4 text-slate-700" />
                  <h3 className="font-bold text-slate-900 text-base">{step.title}</h3>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Standard Municipal SLA Resolution Targets</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <p className="text-xs font-bold text-rose-700 uppercase">Critical Priority</p>
              <p className="text-2xl font-black text-rose-900 mt-1">12 - 24h</p>
              <p className="text-[10px] text-rose-600 mt-0.5">Water mains / Hazards</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs font-bold text-amber-700 uppercase">High Priority</p>
              <p className="text-2xl font-black text-amber-900 mt-1">24 - 48h</p>
              <p className="text-[10px] text-amber-600 mt-0.5">Potholes / Waste spill</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs font-bold text-blue-700 uppercase">Medium Priority</p>
              <p className="text-2xl font-black text-blue-900 mt-1">48 - 72h</p>
              <p className="text-[10px] text-blue-600 mt-0.5">Streetlights / Trees</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-700 uppercase">Low Priority</p>
              <p className="text-2xl font-black text-slate-900 mt-1">7 Days</p>
              <p className="text-[10px] text-slate-600 mt-0.5">Signboards / Minor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
