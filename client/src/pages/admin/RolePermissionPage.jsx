import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export const RolePermissionPage = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRBAC();
  }, []);

  const fetchRBAC = async () => {
    setLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([
        api.get('/admin/roles'),
        api.get('/admin/permissions')
      ]);
      if (rRes.success) setRoles(rRes.roles || []);
      if (pRes.success) setPermissions(pRes.permissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Role-Based Access Control (RBAC) Matrix</h1>
        <p className="text-xs text-slate-500">System roles and their backend cryptographic authorization mappings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={role._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-brand-50 text-brand-700 font-extrabold text-xs uppercase rounded-lg border border-brand-200">
                {role.name}
              </span>
              <span className="text-xs text-slate-400 font-mono">{role.permissions?.length || 0} permissions</span>
            </div>

            <h3 className="font-bold text-slate-900 text-sm">{role.displayName}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{role.description}</p>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Granted Permissions:</p>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions?.map((p, i) => (
                  <span key={i} className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
