import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Search, Download, Filter, Shield } from 'lucide-react';
import { api } from '../../services/api';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, resultFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let endpoint = `/admin/audit-logs?action=${actionFilter}&result=${resultFilter}&limit=50`;
      if (search) endpoint += `&search=${encodeURIComponent(search)}`;
      const data = await api.get(endpoint);
      if (data.success) setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'Resource ID', 'IP Address', 'Result'];
    const rows = logs.map(l => [
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${l.userName} (${l.userEmail})"`,
      `"${l.role}"`,
      `"${l.action}"`,
      `"${l.resource}"`,
      `"${l.resourceId}"`,
      `"${l.ipAddress}"`,
      `"${l.result}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CivicShield_AuditLog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Audit Logs</h1>
          <p className="text-xs text-slate-500">Immutable administrative audit trail of user actions, logins, state modifications, and role updates</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user, email, resource ID, or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
          >
            <option value="all">All Results</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILURE">Failure</option>
            <option value="DENIED">Denied</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Actor</th>
              <th className="p-4">Action</th>
              <th className="p-4">Resource & ID</th>
              <th className="p-4">IP Address</th>
              <th className="p-4">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading audit trail...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">No logs found.</td></tr>
            ) : (
              logs.map((l) => (
                <tr key={l._id} className="hover:bg-slate-50/70 transition">
                  <td className="p-4 text-slate-500 whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{l.userName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{l.userEmail} ({l.role})</p>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      {l.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 font-medium">
                    {l.resource} {l.resourceId && <span className="font-mono text-slate-500 text-[10px]">[{l.resourceId}]</span>}
                  </td>
                  <td className="p-4 font-mono text-slate-500 text-[11px]">
                    {l.ipAddress}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      l.result === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {l.result}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
