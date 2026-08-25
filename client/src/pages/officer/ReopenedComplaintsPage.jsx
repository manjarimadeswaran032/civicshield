import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, AlertTriangle, ChevronRight, User } from 'lucide-react';
import { api } from '../../services/api';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SLAIndicator } from '../../components/common/SLAIndicator';

export const ReopenedComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReopened();
  }, []);

  const fetchReopened = async () => {
    setLoading(true);
    try {
      const data = await api.get('/officer/complaints?status=Reopened');
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
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Citizen Reopened Issues</h1>
        <p className="text-xs text-slate-500">Complaints where citizens rejected previous resolution and requested supervisory re-inspection</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading reopened grievances...</div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <RotateCcw className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No Reopened Issues</p>
            <p className="text-xs text-slate-400">All resolved complaints have either been accepted or closed.</p>
          </div>
        ) : (
          complaints.map((c) => (
            <div key={c._id} className="p-5 hover:bg-slate-50 transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {c.complaintId}
                  </span>
                  <span className="text-xs font-bold text-rose-600 uppercase bg-rose-100 px-2 py-0.5 rounded-full">
                    Reopen Count: {c.reopenCount || 1}
                  </span>
                  <PriorityBadge priority={c.priority} />
                </div>
                <SLAIndicator deadline={c.slaDeadline} isOverdue={c.isOverdue} resolvedAt={c.resolvedAt} />
              </div>

              <Link to={`/officer/complaints/${c.complaintId}`} className="text-base font-bold text-slate-900 hover:text-brand-600 transition block">
                {c.title}
              </Link>

              {c.reopenReason && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900">
                  <strong>Citizen Reopening Rationale:</strong> "{c.reopenReason}"
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">Citizen: {c.citizenName} ({c.citizenPhone}) • Assigned: {c.assignedOfficerName || 'None'}</span>
                <Link to={`/officer/complaints/${c.complaintId}`} className="text-xs font-bold text-brand-600 hover:underline flex items-center">
                  <span>Take Action</span>
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
