import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield,
  Building2,
  MapPin,
  Calendar,
  User,
  Clock,
  CheckCircle,
  RotateCcw,
  AlertTriangle,
  ArrowLeft,
  Wrench,
  UserCheck,
  Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SLAIndicator } from '../../components/common/SLAIndicator';
import { ComplaintTimeline } from '../../components/common/ComplaintTimeline';
import { Modal } from '../../components/common/Modal';

export const OfficerComplaintDetailPage = () => {
  const { id } = useParams();
  const { user, isManager, isAdmin } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Action States
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  const [newStatus, setNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [resolutionProof, setResolutionProof] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaint();
    if (isManager() || isAdmin()) {
      fetchOfficers();
    }
  }, [id]);

  const fetchComplaint = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/complaints/${id}`);
      if (data.success && data.complaint) {
        setComplaint(data.complaint);
        setNewStatus(data.complaint.status);
      }
    } catch (err) {
      setError(err.message || 'Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const data = await api.get('/admin/users?role=officer&limit=50');
      if (data.success) {
        setOfficers(data.users || []);
      }
    } catch (e) {}
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const data = await api.put(`/officer/complaints/${complaint.complaintId}/status`, {
        status: newStatus,
        remarks: statusRemarks
      });
      if (data.success) {
        setShowStatusModal(false);
        setComplaint(data.complaint);
        setStatusRemarks('');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const data = await api.put(`/officer/complaints/${complaint.complaintId}/assign`, {
        officerId: selectedOfficerId,
        remarks: `Assigned to field officer by ${user.name}`
      });
      if (data.success) {
        setShowAssignModal(false);
        setComplaint(data.complaint);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolutionRemarks.trim() || resolutionRemarks.length < 5) {
      alert('Please enter detailed resolution remarks (min 5 characters)');
      return;
    }
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('resolutionRemarks', resolutionRemarks);
      if (resolutionProof) {
        formData.append('proofImage', resolutionProof);
      }

      const data = await api.put(`/officer/complaints/${complaint.complaintId}/resolve`, formData);
      if (data.success) {
        setShowResolveModal(false);
        setComplaint(data.complaint);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading complaint...</div>;
  if (error || !complaint) return <div className="p-8 text-center text-rose-600">{error || 'Complaint not found'}</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Queue</span>
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        <div className="p-6 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200">
                {complaint.complaintId}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">{complaint.title}</h1>
          </div>
          <SLAIndicator deadline={complaint.slaDeadline} isOverdue={complaint.isOverdue} resolvedAt={complaint.resolvedAt} />
        </div>

        {/* Action Buttons Toolbar */}
        <div className="p-4 bg-slate-100/70 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowStatusModal(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Update Lifecycle Status
          </button>

          {(isManager() || isAdmin()) && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Assign / Reassign Officer
            </button>
          )}

          {complaint.status !== 'Resolved' && complaint.status !== 'Closed' && (
            <button
              onClick={() => setShowResolveModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Mark as Resolved
            </button>
          )}
        </div>

        {/* Citizen & Location Metadata */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <p className="font-bold text-slate-400 uppercase tracking-wider">Citizen & Department</p>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p className="font-bold text-slate-900">{complaint.citizenName}</p>
              <p className="text-slate-600">Email: {complaint.citizenEmail}</p>
              <p className="text-slate-600">Phone: {complaint.citizenPhone || 'Not provided'}</p>
              <p className="text-slate-600">Assigned Officer: <span className="font-bold text-brand-700">{complaint.assignedOfficerName || 'Unassigned'}</span></p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-slate-400 uppercase tracking-wider">Location</p>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p className="font-bold text-slate-900">{complaint.location.address}</p>
              <p className="text-slate-600">{complaint.location.city} {complaint.location.postalCode}</p>
              {complaint.location.coordinates?.lat !== 0 && (
                <p className="font-mono text-[11px] text-slate-400">GPS: {complaint.location.coordinates?.lat}, {complaint.location.coordinates?.lng}</p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Citizen Problem Statement</p>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {complaint.description}
            </p>
          </div>

          {complaint.imageUrl && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Complaint Photo</p>
              <img src={complaint.imageUrl} alt="Complaint Evidence" className="max-h-64 rounded-xl border border-slate-200 shadow-sm" />
            </div>
          )}
        </div>

        {/* Resolution Remarks */}
        {complaint.resolutionRemarks && (
          <div className="p-6 bg-emerald-50/40 space-y-2">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Recorded Resolution Remarks</p>
            <p className="text-sm font-medium text-emerald-950">"{complaint.resolutionRemarks}"</p>
          </div>
        )}

        {/* History */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Audit Lifecycle History</h3>
          <ComplaintTimeline history={complaint.statusHistory} />
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Update Complaint Status">
        <form onSubmit={handleStatusUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
            >
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status Remarks</label>
            <textarea
              rows="3"
              placeholder="e.g., Road repair crew arrived on site with materials..."
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
            />
          </div>

          <button type="submit" disabled={actionLoading} className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl">
            {actionLoading ? 'Updating...' : 'Save Status Update'}
          </button>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign / Reassign Field Officer">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Field Officer</label>
            <select
              required
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
            >
              <option value="">-- Choose Field Officer --</option>
              {officers.map(off => (
                <option key={off._id} value={off._id}>{off.name} ({off.email})</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={actionLoading} className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl">
            {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </form>
      </Modal>

      {/* Resolve Modal */}
      <Modal isOpen={showResolveModal} onClose={() => setShowResolveModal(false)} title="Submit Resolution Report">
        <form onSubmit={handleResolve} className="space-y-4">
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
            Detail the physical corrective action taken. The citizen will be notified to inspect and confirm.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Corrective Action Taken *</label>
            <textarea
              required
              rows="3"
              placeholder="e.g., Damaged 90W driver replaced; 5 streetlight poles tested and fully functional..."
              value={resolutionRemarks}
              onChange={(e) => setResolutionRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Resolution Proof Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setResolutionProof(e.target.files[0])}
              className="text-xs text-slate-600"
            />
          </div>

          <button type="submit" disabled={actionLoading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl">
            {actionLoading ? 'Submitting...' : 'Mark Complaint Resolved'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
