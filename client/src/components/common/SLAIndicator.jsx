import React from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export const SLAIndicator = ({ deadline, isOverdue, resolvedAt }) => {
  if (resolvedAt) {
    return (
      <span className="inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Resolved
      </span>
    );
  }

  if (isOverdue) {
    return (
      <span className="inline-flex items-center text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-300 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" /> SLA Overdue
      </span>
    );
  }

  if (!deadline) return null;

  const target = new Date(deadline);
  const now = new Date();
  const diffHours = Math.round((target - now) / (1000 * 60 * 60));

  if (diffHours < 0) {
    return (
      <span className="inline-flex items-center text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-300">
        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Overdue
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
      {diffHours > 24 ? `${Math.round(diffHours / 24)} days left` : `${diffHours}h remaining`}
    </span>
  );
};
