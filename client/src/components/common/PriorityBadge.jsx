import React from 'react';

export const PriorityBadge = ({ priority }) => {
  const getPriorityStyles = () => {
    switch (priority) {
      case 'Low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300 ring-1 ring-rose-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${getPriorityStyles()}`}>
      {priority === 'Critical' && <span className="w-2 h-2 mr-1 rounded-full bg-rose-500 animate-ping"></span>}
      {priority || 'Medium'}
    </span>
  );
};
