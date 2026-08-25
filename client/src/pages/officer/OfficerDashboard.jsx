import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Users,
  Building2,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SLAIndicator } from '../../components/common/SLAIndicator';

export const OfficerDashboard = () => {
  const { user, isManager } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    overdue: 0,
    reopened: 0
  });

  useEffect(() => {
    fetchOfficerData();
  }, []);

  const fetchOfficerData = async () => {
    setLoading(true);
    try {
      const data = await api.get('/officer/complaints?limit=6');
      if (data.success) {
        setComplaints(data.complaints || []);
        
        // Compute counts
        const all = await api.get('/officer/complaints?limit=100');
        const list = all.complaints || [];
        setStats({
          assigned: list.length,
          inProgress: list.filter(c => c.status === 'In Progress').length,
          overdue: list.filter(c => c.isOverdue).length,
          reopened: list.filter(c => c.status === 'Reopened').length
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-600/30 text-brand-300 rounded-full text-xs font-bold border border-brand-500/30">
            <Building2 className="w-4 h-4" />
            <span>{isManager() ? 'Department Operations Manager' : 'Municipal Field Officer Portal'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user?.name}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
            Assigned Queue Jurisdiction: {user?.department?.name || 'Central Municipal Maintenance Division'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/officer/complaints"
            className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Manage All Complaints
          </Link>
        </div>
      </div>

      {/* Emergency SLA Banner if overdue items exist */}
      {stats.overdue > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3 text-rose-800 text-xs sm:text-sm font-semibold">
            <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
            <span>Attention: <strong>{stats.overdue} complaint(s)</strong> have breached SLA and are flagged as overdue. Immediate action required.</span>
          </div>
          <Link to="/officer/escalated" className="text-xs font-bold text-rose-700 hover:underline shrink-0">
            View Overdue Queue →
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active In Queue</p>
          <p className="text-3xl font-extrabold text-slate-900">{stats.assigned}</p>
          <p className="text-[11px] text-slate-500">Department assigned</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">In Progress</p>
          <p className="text-3xl font-extrabold text-amber-600">{stats.inProgress}</p>
          <p className="text-[11px] text-slate-500">Work crews deployed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">SLA Overdue</p>
          <p className="text-3xl font-extrabold text-rose-600">{stats.overdue}</p>
          <p className="text-[11px] text-slate-500">Escalated to supervision</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Reopened by Citizen</p>
          <p className="text-3xl font-extrabold text-purple-600">{stats.reopened}</p>
          <p className="text-[11px] text-slate-500">Requires re-inspection</p>
        </div>
      </div>

      {/* Actionable Complaints List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Actionable Complaint Queue</h2>
            <p className="text-xs text-slate-500">Complaints assigned to your division sorted by SLA urgency</p>
          </div>
          <Link to="/officer/complaints" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1">
            <span>View Full Queue</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading department queue...</div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No active complaints in queue.</div>
        ) : (
          complaints.map((c) => (
            <div key={c._id} className="p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {c.complaintId}
                  </span>
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                </div>
                <Link
                  to={`/officer/complaints/${c.complaintId}`}
                  className="text-sm font-bold text-slate-900 hover:text-brand-600 transition block"
                >
                  {c.title}
                </Link>
                <p className="text-xs text-slate-500">
                  Citizen: <span className="font-medium text-slate-700">{c.citizenName}</span> ({c.citizenPhone || 'No phone'}) • Location: {c.location.address}
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <SLAIndicator deadline={c.slaDeadline} isOverdue={c.isOverdue} resolvedAt={c.resolvedAt} />
                <Link
                  to={`/officer/complaints/${c.complaintId}`}
                  className="px-3 py-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition flex items-center space-x-1"
                >
                  <span>Inspect & Act</span>
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
