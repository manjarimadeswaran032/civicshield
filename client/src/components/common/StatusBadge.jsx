import React from 'react';

export const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under Review':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Assigned':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Resolved':
      case 'Awaiting Citizen Confirmation':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Closed':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Reopened':
        return 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles()}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current"></span>
      {status || 'Unknown'}
    </span>
  );
};
