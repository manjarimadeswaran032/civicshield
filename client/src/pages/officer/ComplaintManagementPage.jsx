import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronRight, AlertTriangle, Building2 } from 'lucide-react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SLAIndicator } from '../../components/common/SLAIndicator';

export const ComplaintManagementPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isOverdueOnly, setIsOverdueOnly] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, priorityFilter, isOverdueOnly]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let endpoint = `/officer/complaints?status=${statusFilter}&priority=${priorityFilter}`;
      if (isOverdueOnly) endpoint += `&isOverdue=true`;
      if (search) endpoint += `&search=${encodeURIComponent(search)}`;
      const data = await api.get(endpoint);
      if (data.success) {
        setComplaints(data.complaints || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Municipal Complaint Operations</h1>
        <p className="text-xs text-slate-500">Filter, inspect, assign officers, and advance complaint lifecycle states</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, title, citizen name, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Reopened">Reopened</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <label className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isOverdueOnly}
              onChange={(e) => setIsOverdueOnly(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span>Overdue Only</span>
          </label>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No complaints found for current criteria.</div>
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
                  Citizen: <span className="font-semibold text-slate-700">{c.citizenName}</span> • Assigned: {c.assignedOfficerName || 'None'} • Location: {c.location.address}
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <SLAIndicator deadline={c.slaDeadline} isOverdue={c.isOverdue} resolvedAt={c.resolvedAt} />
                <Link
                  to={`/officer/complaints/${c.complaintId}`}
                  className="px-3.5 py-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition flex items-center space-x-1"
                >
                  <span>Manage</span>
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
