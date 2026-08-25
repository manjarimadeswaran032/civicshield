import React, { useState, useEffect } from 'react';
import { Building2, Plus, Phone, Mail, UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import { Modal } from '../../components/common/Modal';

export const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '', contactEmail: '', contactPhone: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/departments');
      if (data.success) setDepartments(data.departments || []);
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
      await api.post('/admin/departments', newDept);
      setShowModal(false);
      fetchDepartments();
      setNewDept({ name: '', code: '', description: '', contactEmail: '', contactPhone: '' });
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Municipal Department Directory</h1>
          <p className="text-xs text-slate-500">Manage operational divisions, jurisdiction contacts, and grievance routing</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((d) => (
          <div key={d._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200">
                {d.code}
              </span>
              <span className="text-xs text-emerald-600 font-bold">● Active</span>
            </div>

            <h3 className="font-bold text-slate-900 text-sm">{d.name}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{d.description}</p>

            <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <p className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{d.contactEmail || 'No email'}</p>
              <p className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{d.contactPhone || 'No phone'}</p>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register Municipal Department">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Department Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Roads & Transportation Infrastructure"
              value={newDept.name}
              onChange={(e) => setNewDept(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Department Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. ROADS"
              value={newDept.code}
              onChange={(e) => setNewDept(prev => ({ ...prev, code: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
            <textarea
              rows="2"
              value={newDept.description}
              onChange={(e) => setNewDept(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
            />
          </div>

          <button type="submit" disabled={actionLoading} className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl">
            {actionLoading ? 'Creating...' : 'Register Department'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
