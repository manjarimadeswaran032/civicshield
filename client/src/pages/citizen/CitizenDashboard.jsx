import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FilePlus,
  Files,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SLAIndicator } from '../../components/common/SLAIndicator';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    needsConfirmation: 0
  });

  useEffect(() => {
    fetchCitizenData();
  }, []);

  const fetchCitizenData = async () => {
    try {
      setLoading(true);
      const data = await api.get('/complaints/my?limit=5');
      if (data.success) {
        setComplaints(data.complaints || []);
        
        // Calculate counts
        const all = await api.get('/complaints/my?limit=100');
        const list = all.complaints || [];
        setStats({
          total: list.length,
          inProgress: list.filter(c => ['Under Review', 'Assigned', 'In Progress'].includes(c.status)).length,
          resolved: list.filter(c => ['Resolved', 'Closed'].includes(c.status)).length,
          needsConfirmation: list.filter(c => c.status === 'Resolved').length
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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Authenticated Citizen Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-brand-100 text-xs sm:text-sm max-w-xl">
            Report municipal infrastructure issues, monitor live resolution progress, and verify completed field repairs.
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="px-6 py-3.5 bg-white text-brand-700 hover:bg-brand-50 font-bold text-sm rounded-2xl shadow-lg transition shrink-0 flex items-center justify-center space-x-2"
        >
          <FilePlus className="w-5 h-5 text-brand-600" />
          <span>Report New Grievance</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Complaints</p>
          <p className="text-3xl font-extrabold text-slate-900">{stats.total}</p>
          <p className="text-[11px] text-slate-500">Registered under your account</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">In Active Progress</p>
          <p className="text-3xl font-extrabold text-amber-600">{stats.inProgress}</p>
          <p className="text-[11px] text-slate-500">Field units deployed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Resolved / Closed</p>
          <p className="text-3xl font-extrabold text-emerald-600">{stats.resolved}</p>
          <p className="text-[11px] text-slate-500">Corrective actions taken</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Needs Confirmation</p>
          <p className="text-3xl font-extrabold text-indigo-600">{stats.needsConfirmation}</p>
          <p className="text-[11px] text-slate-500">Awaiting your inspection</p>
        </div>
      </div>

      {/* Recent Complaints Table & Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Recent Grievances</h2>
            <p className="text-xs text-slate-500">Track current status, assigned officers, and SLA deadlines</p>
          </div>
          <Link
            to="/citizen/my-complaints"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading your grievances...</div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Files className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No complaints reported yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              If you notice potholes, dark streetlights, or waste overflow in your area, submit a report to get it fixed.
            </p>
            <Link
              to="/citizen/report"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-brand-700 transition"
            >
              <FilePlus className="w-4 h-4" />
              <span>File First Complaint</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <div key={c._id} className="p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {c.complaintId}
                    </span>
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <Link
                    to={`/citizen/complaints/${c.complaintId}`}
                    className="text-sm font-bold text-slate-900 hover:text-brand-600 transition block"
                  >
                    {c.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    Category: <span className="font-medium text-slate-700">{c.category}</span> • Reported on {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <SLAIndicator deadline={c.slaDeadline} isOverdue={c.isOverdue} resolvedAt={c.resolvedAt} />
                  <Link
                    to={`/citizen/complaints/${c.complaintId}`}
                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
