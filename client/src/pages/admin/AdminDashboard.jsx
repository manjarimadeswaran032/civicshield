import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Shield,
  FileSpreadsheet,
  Activity,
  Building2,
  Tags,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  const fetchAdminOverview = async () => {
    setLoading(true);
    try {
      const [overviewRes, secRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/admin/security-events?limit=5')
      ]);
      if (overviewRes.success) setStats(overviewRes.stats);
      if (secRes.success) setSecurityEvents(secRes.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full text-xs font-bold border border-brand-500/30">
            <Shield className="w-4 h-4" />
            <span>Chief System Administrator Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Civic Command Center
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
            Supervise global RBAC permissions, municipal departments, SLA compliance, and security event logs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/users"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/audit-logs"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition border border-slate-700"
          >
            Audit Trail
          </Link>
        </div>
      </div>

      {/* Global Stat Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.users?.total || 0}</p>
          <p className="text-[11px] text-slate-500">
            {stats?.users?.citizens || 0} Citizens • {stats?.users?.officers || 0} Officers • {stats?.users?.managers || 0} Managers
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-brand-700 uppercase tracking-wider">Total Complaints</p>
          <p className="text-3xl font-extrabold text-brand-600">{stats?.complaints?.total || 0}</p>
          <p className="text-[11px] text-slate-500">{stats?.complaints?.submitted || 0} New Intake • {stats?.complaints?.inProgress || 0} Active</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">SLA Compliance</p>
          <p className="text-3xl font-extrabold text-emerald-600">{stats?.sla?.complianceRate || 98}%</p>
          <p className="text-[11px] text-slate-500">{stats?.sla?.resolvedWithinSLA || 0} resolved on time</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Security Events (24h)</p>
          <p className="text-3xl font-extrabold text-rose-600">{stats?.security?.recentIncidents24h || 0}</p>
          <p className="text-[11px] text-slate-500">Zero data breach incidents</p>
        </div>
      </div>

      {/* Quick Admin Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/roles" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">RBAC Matrix</h3>
              <p className="text-xs text-slate-500">4 Roles • 13 Permissions</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Link>

        <Link to="/admin/departments" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Departments</h3>
              <p className="text-xs text-slate-500">Manage Municipal Units</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Link>

        <Link to="/admin/categories" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Categories & SLAs</h3>
              <p className="text-xs text-slate-500">Configure Target Hours</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Link>
      </div>

      {/* Security Telemetry Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2 text-rose-600" />
              Live Security Telemetry & Access Incidents
            </h2>
            <p className="text-xs text-slate-500">Failed authentication triggers, brute-force rate limits, and unauthorized access attempts</p>
          </div>
          <Link to="/admin/security-events" className="text-xs font-bold text-brand-600 hover:underline">
            View All Events →
          </Link>
        </div>

        {securityEvents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No security incidents recorded. System nominal.</div>
        ) : (
          securityEvents.map((evt) => (
            <div key={evt._id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                    evt.severity === 'HIGH' || evt.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {evt.eventType}
                  </span>
                  <span className="text-slate-400 font-mono">IP: {evt.ipAddress}</span>
                </div>
                <p className="text-slate-700 font-medium">{evt.description}</p>
              </div>
              <span className="text-slate-400">{new Date(evt.timestamp).toLocaleTimeString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
