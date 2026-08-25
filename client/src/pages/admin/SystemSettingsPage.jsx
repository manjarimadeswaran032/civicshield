import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export const SystemSettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/settings');
      if (data.success) setSettings(data.settings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key, value) => {
    try {
      await api.put('/admin/settings', { key, value });
      setSuccess(`Setting '${key}' updated successfully`);
      setTimeout(() => setSuccess(null), 3000);
      fetchSettings();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Environment Configuration</h1>
        <p className="text-xs text-slate-500">Tune automated SLA evaluation intervals, escalation alerts, and public broadcast banners</p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-4 divide-y divide-slate-100">
          <div className="pt-4 first:pt-0 space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Automated SLA Escalation Engine</h3>
            <p className="text-xs text-slate-500">Periodically polls active complaints and automatically flags SLA breaches.</p>
            <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-md">
              Engine Active (60s Ticker)
            </span>
          </div>

          <div className="pt-4 space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Cryptographic Transport Security</h3>
            <p className="text-xs text-slate-500">HTTPS/TLS End-to-End Encryption active on all API gateway endpoints.</p>
            <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-md">
              TLS 1.3 Strict Mode
            </span>
          </div>

          <div className="pt-4 space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Brute-Force Rate Limiting</h3>
            <p className="text-xs text-slate-500">20 login attempts per 15 minutes limit per IP address.</p>
            <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-md">
              Active Protection
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
