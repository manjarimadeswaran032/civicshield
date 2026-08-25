import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Shield, Building2, MapPin, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SLAIndicator } from '../../components/common/SLAIndicator';
import { ComplaintTimeline } from '../../components/common/ComplaintTimeline';

export const PublicTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const [searchId, setSearchId] = useState(searchParams.get('id') || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryId = searchParams.get('id');
    if (queryId) {
      setSearchId(queryId);
      performSearch(queryId);
    }
  }, [searchParams]);

  const performSearch = async (idToSearch) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setError(null);
    setComplaint(null);

    try {
      const data = await api.get(`/complaints/track/${encodeURIComponent(idToSearch.trim())}`);
      if (data.success && data.complaint) {
        setComplaint(data.complaint);
      } else {
        setError('Complaint tracking record not found. Please verify your Complaint ID.');
      }
    } catch (err) {
      setError(err.message || 'Complaint ID not found in municipal registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(searchId);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
            <Shield className="w-4 h-4" />
            <span>Public Verification Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Live Complaint Tracking
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Check the real-time progress, inspection remarks, and SLA deadlines of any civic complaint.
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Complaint ID (e.g., CIV-2026-000001)..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-brand-500/25 shrink-0 flex items-center justify-center space-x-2"
            >
              {loading ? <span>Searching...</span> : <span>Track Status</span>}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Quick test IDs:</span>
            {['CIV-2026-000001', 'CIV-2026-000002', 'CIV-2026-000003', 'CIV-2026-000004'].map((demoId) => (
              <button
                key={demoId}
                type="button"
                onClick={() => {
                  setSearchId(demoId);
                  performSearch(demoId);
                }}
                className="font-mono bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium"
              >
                {demoId}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {complaint && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100 animate-fade-in">
            <div className="p-6 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-mono text-sm font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200">
                    {complaint.complaintId}
                  </span>
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{complaint.title}</h2>
              </div>
              <SLAIndicator deadline={complaint.slaDeadline} isOverdue={complaint.isOverdue} resolvedAt={complaint.resolvedAt} />
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Jurisdiction & Category</p>
                <div className="flex items-center space-x-2 text-sm text-slate-800">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold">{complaint.category}</span>
                </div>
                <p className="text-xs text-slate-500">Department: {complaint.assignedDepartmentName || 'Pending Intake'}</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Location</p>
                <div className="flex items-center space-x-2 text-sm text-slate-800">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{complaint.location.address}, {complaint.location.city}</span>
                </div>
              </div>
            </div>

            {complaint.resolutionRemarks && (
              <div className="p-6 bg-emerald-50/40">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">Official Resolution Report</p>
                <p className="text-sm text-emerald-950 font-medium">"{complaint.resolutionRemarks}"</p>
                {complaint.resolvedAt && (
                  <p className="text-xs text-emerald-700 mt-2">Resolved on: {new Date(complaint.resolvedAt).toLocaleString()}</p>
                )}
              </div>
            )}

            <div className="p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Status Lifecycle History</h3>
              <ComplaintTimeline history={complaint.statusHistory} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
