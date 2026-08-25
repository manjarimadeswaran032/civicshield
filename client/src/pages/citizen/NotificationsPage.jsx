import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500">Live alerts regarding your complaints, progress updates, and resolutions</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No notifications yet</p>
            <p className="text-xs text-slate-400">Updates regarding your complaints will appear here in real-time.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                markAsRead(n._id);
                if (n.link) navigate(n.link);
              }}
              className={`p-4 sm:p-5 hover:bg-slate-50 transition cursor-pointer flex items-start justify-between gap-4 ${
                !n.isRead ? 'bg-brand-50/40 border-l-4 border-brand-600' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">{n.title}</span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-slate-400 flex items-center space-x-1 pt-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
