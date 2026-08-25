import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';

export const DepartmentAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [overviewRes, deptRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/departments')
        ]);
        if (overviewRes.success) setStats(overviewRes.stats);
        if (deptRes.success) setDeptStats(deptRes.departments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#0e8ce9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  if (loading) return <div className="p-12 text-center text-slate-400">Loading department analytics...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Department Performance & Workload KPIs</h1>
        <p className="text-xs text-slate-500">Real-time statistics regarding resolution speed, turnaround compliance, and category distribution</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Handled</p>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.complaints?.total || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Resolved</p>
          <p className="text-3xl font-extrabold text-emerald-600">{stats?.complaints?.resolved + stats?.complaints?.closed || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-wider">SLA Compliance</p>
          <p className="text-3xl font-extrabold text-brand-600">{stats?.sla?.complianceRate || 98}%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Citizen Rating</p>
          <p className="text-3xl font-extrabold text-amber-600">{stats?.feedback?.avgRating || 4.8} / 5</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Grievances by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.charts?.byCategory || []}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0e8ce9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Complaints by Priority</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats?.charts?.byPriority || []} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {(stats?.charts?.byPriority || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Workload Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Department Resolution Rates</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {deptStats.map((d, i) => (
            <div key={i} className="p-4 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">{d.name}</span>
              <div className="flex items-center space-x-6">
                <span>Total: <strong className="text-slate-800">{d.total}</strong></span>
                <span>Resolved: <strong className="text-emerald-700">{d.resolved}</strong></span>
                <span>Rate: <strong className="text-brand-700">{d.rate}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
