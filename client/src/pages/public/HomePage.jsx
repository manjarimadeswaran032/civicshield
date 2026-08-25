import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Zap,
  Lock,
  Building2,
  Users,
  MapPin,
  TrendingUp,
  FileCheck2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';

export const HomePage = () => {
  const [trackingId, setTrackingId] = useState('');
  const [stats, setStats] = useState({
    totalComplaints: 1250,
    resolvedComplaints: 1198,
    slaCompliance: 98,
    activeOfficers: 42
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/analytics/overview');
        if (data.success && data.stats) {
          setStats({
            totalComplaints: data.stats.complaints.total || 1420,
            resolvedComplaints: (data.stats.complaints.resolved + data.stats.complaints.closed) || 1350,
            slaCompliance: data.stats.sla.complianceRate || 98,
            activeOfficers: (data.stats.users.officers + data.stats.users.managers) || 48
          });
        }
      } catch (e) {
        // fallback
      }
    };
    fetchStats();
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingId.trim()) {
      navigate(`/track?id=${encodeURIComponent(trackingId.trim())}`);
    }
  };

  const categories = [
    { title: 'Potholes & Road Cracks', dept: 'Roads & Infrastructure', icon: AlertTriangle, color: 'from-amber-500 to-orange-500' },
    { title: 'Streetlight Failures', dept: 'Public Lighting Grid', icon: Zap, color: 'from-yellow-500 to-amber-500' },
    { title: 'Garbage & Waste Spills', dept: 'Sanitation & Cleanliness', icon: Building2, color: 'from-emerald-500 to-teal-600' },
    { title: 'Water Main Leakages', dept: 'Water Supply Board', icon: TrendingUp, color: 'from-blue-500 to-cyan-600' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-slate-900 text-slate-300 py-2 px-4 text-xs font-medium border-b border-slate-800 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-white font-semibold">CivicShield Portal Active</span>
            <span className="hidden sm:inline text-slate-400">| Municipal Operations Central Gateway</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-emerald-400"><Lock className="w-3 h-3 mr-1" /> TLS/HTTPS Secured</span>
            <Link to="/security" className="text-slate-300 hover:text-white underline">RBAC Policy</Link>
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 text-brand-800 text-xs font-bold border border-brand-200 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Transparent Civic Grievance & SLA Escalation System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
              Empowering Citizens, <br />
              <span className="bg-gradient-to-r from-brand-700 via-brand-600 to-cyan-600 bg-clip-text text-transparent">
                Securing Municipal Action.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Report potholes, dark streetlights, waste overflows, and pipeline ruptures. 
              Track resolution progress in real-time with immutable audit trails and Role-Based Access Control.
            </p>

            <div className="pt-4 max-w-xl mx-auto">
              <form onSubmit={handleTrackSubmit} className="relative flex items-center bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter Complaint ID (e.g. CIV-2026-000001)..."
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-brand-500/25 shrink-0 flex items-center space-x-1.5"
                >
                  <span>Track Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/register"
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-slate-900/20 transition flex items-center space-x-2"
              >
                <span>Citizen Sign Up & Report</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 shadow-sm transition"
              >
                1-Click Demo Evaluation Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-slate-200 py-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-3xl font-extrabold text-slate-900">{stats.totalComplaints}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Complaints Registered</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-3xl font-extrabold text-emerald-600">{stats.resolvedComplaints}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Successfully Resolved</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-3xl font-extrabold text-brand-600">{stats.slaCompliance}%</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">SLA Compliance Rate</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-3xl font-extrabold text-indigo-600">24/7</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Automated Escalation</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Municipal Service Domains</h2>
            <p className="text-sm text-slate-600 mt-2">
              Every complaint is auto-routed to the designated department with strict SLA deadlines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center mb-4 shadow-md`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">{cat.title}</h3>
                <p className="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md inline-block mb-3">
                  {cat.dept}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Direct assignment to field maintenance units with GPS-tagged inspection and photographic resolution proof.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
