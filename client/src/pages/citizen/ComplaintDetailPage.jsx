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
  Star,
  AlertTriangle,
  FileCheck2,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SLAIndicator } from '../../components/common/SLAIndicator';
import { ComplaintTimeline } from '../../components/common/ComplaintTimeline';
import { Modal } from '../../components/common/Modal';
import { RatingStars } from '../../components/common/RatingStars';

export const ComplaintDetailPage = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/complaints/${id}`);
      if (data.success && data.complaint) {
        setComplaint(data.complaint);
      }
    } catch (err) {
      setError(err.message || 'Failed to load complaint dossier');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResolution = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const data = await api.put(`/complaints/${complaint._id}/confirm-resolution`, {
        rating,
        comment: feedbackComment,
        remarks: 'Citizen confirmed resolution quality'
      });
      if (data.success) {
        setShowConfirmModal(false);
        setComplaint(data.complaint);
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      alert('Please provide a specific reason for reopening');
      return;
    }
    setActionLoading(true);
    try {
      const data = await api.put(`/complaints/${complaint._id}/reopen`, {
        reason: reopenReason
      });
      if (data.success) {
        setShowReopenModal(false);
        setComplaint(data.complaint);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading complaint dossier...</div>;
  }

  if (error || !complaint) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Complaint Record Error</h2>
        <p className="text-xs text-slate-600">{error || 'Complaint not found.'}</p>
        <button onClick={() => navigate('/citizen/my-complaints')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Return to My Complaints
        </button>
      </div>
    );
  }

  const isResolvedOrAwaiting = ['Resolved', 'Awaiting Citizen Confirmation'].includes(complaint.status);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Main Dossier Header Card */}
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

        {/* Action Banner for Resolved Grievance */}
        {isResolvedOrAwaiting && (
          <div className="p-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold flex items-center">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Officer Has Marked This Issue as Resolved
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Please verify the repair on-ground and confirm resolution or reopen if unsatisfied.
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="px-4 py-2 bg-white text-emerald-800 font-bold text-xs rounded-xl shadow hover:bg-emerald-50 transition"
              >
                Confirm & Rate
              </button>
              <button
                type="button"
                onClick={() => setShowReopenModal(true)}
                className="px-4 py-2 bg-emerald-900/60 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition border border-emerald-400/40"
              >
                Reopen Issue
              </button>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <p className="font-bold text-slate-400 uppercase tracking-wider">Department & Category</p>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p className="font-bold text-slate-800">{complaint.category}</p>
              <p className="text-slate-500">Department: {complaint.assignedDepartmentName || 'Pending Intake'}</p>
              <p className="text-slate-500">Assigned Officer: {complaint.assignedOfficerName || 'Not yet assigned'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-slate-400 uppercase tracking-wider">Location & Geo Tag</p>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p className="font-bold text-slate-800">{complaint.location.address}</p>
              <p className="text-slate-500">{complaint.location.city} {complaint.location.postalCode}</p>
              {complaint.location.coordinates?.lat !== 0 && (
                <p className="font-mono text-[11px] text-slate-400">GPS: {complaint.location.coordinates?.lat}, {complaint.location.coordinates?.lng}</p>
              )}
            </div>
          </div>
        </div>

        {/* Description & Uploaded Image */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Description</p>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {complaint.description}
            </p>
          </div>

          {complaint.imageUrl && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Citizen Uploaded Photo Evidence</p>
              <img src={complaint.imageUrl} alt="Complaint Evidence" className="max-h-64 rounded-xl border border-slate-200 shadow-sm" />
            </div>
          )}
        </div>

        {/* Officer Resolution Remarks & Proof */}
        {complaint.resolutionRemarks && (
          <div className="p-6 bg-emerald-50/40 space-y-3">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Field Officer Resolution Remarks</p>
            <p className="text-sm font-medium text-emerald-950">"{complaint.resolutionRemarks}"</p>
            {complaint.resolutionProofUrl && (
              <div>
                <p className="text-xs font-bold text-emerald-800 mb-1">Resolution Proof Photo</p>
                <img src={complaint.resolutionProofUrl} alt="Resolution Proof" className="max-h-56 rounded-xl border border-emerald-200" />
              </div>
            )}
          </div>
        )}

        {/* Reopen Reason if Reopened */}
        {complaint.reopenReason && (
          <div className="p-6 bg-rose-50/50 space-y-1 border-t border-rose-100">
            <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Reopening Rationale</p>
            <p className="text-sm font-medium text-rose-950">"{complaint.reopenReason}"</p>
            <p className="text-xs text-rose-600">Reopened on: {new Date(complaint.reopenedAt).toLocaleString()}</p>
          </div>
        )}

        {/* Feedback Display if Closed */}
        {complaint.feedback?.rating && (
          <div className="p-6 bg-slate-50 space-y-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Citizen Service Rating</p>
            <div className="flex items-center space-x-2">
              <RatingStars rating={complaint.feedback.rating} />
              <span className="text-xs font-bold text-slate-700">{complaint.feedback.rating} / 5 Stars</span>
            </div>
            {complaint.feedback.comment && (
              <p className="text-xs text-slate-600 italic">"{complaint.feedback.comment}"</p>
            )}
          </div>
        )}

        {/* Audit Status History Timeline */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Audit Lifecycle History</h3>
          <ComplaintTimeline history={complaint.statusHistory} />
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Grievance Resolution">
        <form onSubmit={handleConfirmResolution} className="space-y-4">
          <p className="text-xs text-slate-600">
            By confirming resolution, this complaint will be marked as <strong>Closed</strong>. Please rate the service quality provided by the municipal team:
          </p>

          <div className="text-center py-2 space-y-1">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Rate Satisfaction</p>
            <div className="flex justify-center">
              <RatingStars rating={rating} setRating={setRating} interactive={true} size="w-7 h-7" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Feedback Comment (Optional)</label>
            <textarea
              rows="3"
              placeholder="e.g., Quick and clean repair by the team..."
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            {actionLoading ? 'Closing...' : 'Confirm Resolution & Submit Rating'}
          </button>
        </form>
      </Modal>

      {/* Reopen Modal */}
      <Modal isOpen={showReopenModal} onClose={() => setShowReopenModal(false)} title="Reopen Unresolved Complaint">
        <form onSubmit={handleReopen} className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-800 text-xs border border-amber-200">
            Reopening will escalate this issue to the Department Operations Manager for immediate re-inspection.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Reason for Reopening *</label>
            <textarea
              required
              rows="3"
              placeholder="Explain what was left unaddressed or why the problem persists..."
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            {actionLoading ? 'Reopening...' : 'Confirm Reopen & Escalate Issue'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
