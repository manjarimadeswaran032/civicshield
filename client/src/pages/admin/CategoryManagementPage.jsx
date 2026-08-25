import React, { useState, useEffect } from 'react';
import { Tags, Plus, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { Modal } from '../../components/common/Modal';

export const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', code: '', description: '', defaultDepartment: '', defaultPriority: 'Medium', defaultSlaHours: 48 });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, dRes] = await Promise.all([
        api.get('/admin/categories'),
        api.get('/admin/departments')
      ]);
      if (cRes.success) setCategories(cRes.categories || []);
      if (dRes.success) setDepartments(dRes.departments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/admin/categories', newCat);
      setShowModal(false);
      fetchData();
      setNewCat({ name: '', code: '', description: '', defaultDepartment: '', defaultPriority: 'Medium', defaultSlaHours: 48 });
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Complaint Categories & SLA Policies</h1>
          <p className="text-xs text-slate-500">Configure issue classifications, jurisdiction mappings, and maximum resolution SLA hours</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Grievance Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div key={c._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {c.code}
              </span>
              <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200 flex items-center">
                <Clock className="w-3 h-3 mr-1" /> {c.defaultSlaHours}h SLA
              </span>
            </div>

            <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{c.description}</p>
            <p className="text-xs text-slate-600 pt-2 border-t border-slate-100">
              Department: <strong className="text-slate-800">{c.defaultDepartment?.name || 'General Intake'}</strong>
            </p>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Define New Complaint Category">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Water Pipeline Leakage"
              value={newCat.name}
              onChange={(e) => setNewCat(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. WAT"
                value={newCat.code}
                onChange={(e) => setNewCat(prev => ({ ...prev, code: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">SLA Target (Hours)</label>
              <input
                type="number"
                required
                value={newCat.defaultSlaHours}
                onChange={(e) => setNewCat(prev => ({ ...prev, defaultSlaHours: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Responsible Department</label>
            <select
              required
              value={newCat.defaultDepartment}
              onChange={(e) => setNewCat(prev => ({ ...prev, defaultDepartment: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="">-- Choose Department --</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={actionLoading} className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl">
            {actionLoading ? 'Creating...' : 'Register Category'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
