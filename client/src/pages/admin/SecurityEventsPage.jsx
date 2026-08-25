import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Filter, Clock } from 'lucide-react';
import { api } from '../../services/api';

export const SecurityEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, [severityFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let endpoint = `/admin/security-events?severity=${severityFilter}&limit=50`;
      const data = await api.get(endpoint);
      if (data.success) setEvents(data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Security Incident & Threat Telemetry</h1>
          <p className="text-xs text-slate-500">Real-time log of failed authentication, brute-force rate limit triggers, and unauthorized role elevation attempts</p>
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none shadow-sm"
        >
          <option value="all">All Severity Levels</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading security telemetry...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShieldAlert className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Zero Security Threats Detected</p>
            <p className="text-xs text-slate-400">No abnormal traffic or unauthorized elevation incidents recorded.</p>
          </div>
        ) : (
          events.map((evt) => (
            <div key={evt._id} className="p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    evt.severity === 'CRITICAL' || evt.severity === 'HIGH' ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-300' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {evt.severity} • {evt.eventType}
                  </span>
                  <span className="font-mono text-xs text-slate-400">IP: {evt.ipAddress}</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{evt.description}</p>
                {evt.path && (
                  <p className="text-[11px] font-mono text-slate-500">Endpoint: {evt.method} {evt.path}</p>
                )}
              </div>

              <div className="text-right text-xs text-slate-400 shrink-0">
                {new Date(evt.timestamp).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
