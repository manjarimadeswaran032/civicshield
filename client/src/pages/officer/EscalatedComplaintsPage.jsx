import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';

export const EscalatedComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEscalated();
  }, []);

  const fetchEscalated = async () => {
    setLoading(true);
    try {
      const data = await api.get('/officer/complaints?isOverdue=true');
      if (data.success) {
        setComplaints(data.complaints || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">SLA Breached & Overdue Issues</h1>
          <p className="text-xs text-slate-500">High-priority queue of complaints that have exceeded standard resolution turnaround times</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading overdue queue...</div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Clock className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">All Grievances Within SLA Target</p>
            <p className="text-xs text-slate-400">Zero overdue complaints in your department jurisdiction.</p>
          </div>
        ) : (
          complaints.map((c) => (
            <div key={c._id} className="p-5 hover:bg-slate-50 transition space-y-2 border-l-4 border-rose-500">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {c.complaintId}
                </span>
                <span className="text-[10px] font-bold uppercase bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                  Escalation Level {c.escalationLevel || 1}
                </span>
                <StatusBadge status={c.status} />
                <PriorityBadge priority={c.priority} />
              </div>

              <Link to={`/officer/complaints/${c.complaintId}`} className="text-base font-bold text-slate-900 hover:text-brand-600 transition block">
                {c.title}
              </Link>

              {c.escalationAlert && (
                <p className="text-xs text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  🚨 {c.escalationAlert}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Location: {c.location.address} • Officer: {c.assignedOfficerName || 'Unassigned'}</span>
                <Link to={`/officer/complaints/${c.complaintId}`} className="font-bold text-brand-600 hover:underline flex items-center">
                  <span>Fast-Track Resolve</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
