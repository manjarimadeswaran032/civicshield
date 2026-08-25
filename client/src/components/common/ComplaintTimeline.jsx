import React from 'react';
import { CheckCircle2, Clock, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

export const ComplaintTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return <p className="text-sm text-slate-500 italic">No timeline entries recorded yet.</p>;
  }

  return (
    <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 my-4">
      {history.map((item, idx) => {
        const isLatest = idx === history.length - 1;
        return (
          <div key={idx} className="relative group">
            <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 bg-white ${
              isLatest ? 'border-brand-600 bg-brand-600 ring-4 ring-brand-100' : 'border-slate-400'
            }`}></div>
            
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
              <span className="font-bold text-slate-900 text-sm flex items-center">
                {item.newStatus}
                <span className="ml-2 text-xs font-normal text-slate-500">by {item.updatedByName} ({item.updatedByRole})</span>
              </span>
              <span className="text-xs text-slate-400">
                {new Date(item.timestamp).toLocaleString()}
              </span>
            </div>

            {item.remarks && (
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
                "{item.remarks}"
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
