import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus,
  Files,
  Clock,
  RotateCcw,
  AlertTriangle,
  Users,
  ShieldCheck,
  Building2,
  Tags,
  FileSpreadsheet,
  Activity,
  BarChart3,
  Settings,
  Bell,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, isCitizen, isOfficer, isManager, isAdmin } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
      isActive
        ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden lg:flex">
      <div className="space-y-6">
        {/* Role Badge Banner */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
            {user?.role?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">{user?.role} Portal</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-1">
          {/* Citizen Portal Links */}
          {isCitizen() && (
            <>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Citizen Services</p>
              <NavLink to="/citizen/dashboard" className={linkClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/citizen/report" className={linkClass}>
                <FilePlus className="w-4 h-4" />
                <span>Report Complaint</span>
              </NavLink>
              <NavLink to="/citizen/my-complaints" className={linkClass}>
                <Files className="w-4 h-4" />
                <span>My Complaints</span>
              </NavLink>
              <NavLink to="/citizen/notifications" className={linkClass}>
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </NavLink>
              <NavLink to="/citizen/profile" className={linkClass}>
                <UserCheck className="w-4 h-4" />
                <span>Profile & Security</span>
              </NavLink>
            </>
          )}

          {/* Officer & Manager Portal Links */}
          {(isOfficer() || isManager()) && (
            <>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Municipal Operations</p>
              <NavLink to="/officer/dashboard" className={linkClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Officer Queue</span>
              </NavLink>
              <NavLink to="/officer/complaints" className={linkClass}>
                <Files className="w-4 h-4" />
                <span>All Complaints</span>
              </NavLink>
              <NavLink to="/officer/reopened" className={linkClass}>
                <RotateCcw className="w-4 h-4" />
                <span>Reopened Issues</span>
              </NavLink>
              <NavLink to="/officer/escalated" className={linkClass}>
                <AlertTriangle className="w-4 h-4" />
                <span>Overdue & Escalated</span>
              </NavLink>
              <NavLink to="/officer/analytics" className={linkClass}>
                <BarChart3 className="w-4 h-4" />
                <span>Department KPIs</span>
              </NavLink>
            </>
          )}

          {/* Administrator Portal Links */}
          {isAdmin() && (
            <>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">System Administration</p>
              <NavLink to="/admin/dashboard" className={linkClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Command</span>
              </NavLink>
              <NavLink to="/admin/users" className={linkClass}>
                <Users className="w-4 h-4" />
                <span>User Directory</span>
              </NavLink>
              <NavLink to="/admin/roles" className={linkClass}>
                <ShieldCheck className="w-4 h-4" />
                <span>RBAC & Permissions</span>
              </NavLink>
              <NavLink to="/admin/departments" className={linkClass}>
                <Building2 className="w-4 h-4" />
                <span>Departments</span>
              </NavLink>
              <NavLink to="/admin/categories" className={linkClass}>
                <Tags className="w-4 h-4" />
                <span>Categories & SLAs</span>
              </NavLink>
              <NavLink to="/admin/audit-logs" className={linkClass}>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Audit Trail</span>
              </NavLink>
              <NavLink to="/admin/security-events" className={linkClass}>
                <Activity className="w-4 h-4" />
                <span>Security Events</span>
              </NavLink>
              <NavLink to="/admin/analytics" className={linkClass}>
                <BarChart3 className="w-4 h-4" />
                <span>System Analytics</span>
              </NavLink>
              <NavLink to="/admin/settings" className={linkClass}>
                <Settings className="w-4 h-4" />
                <span>System Settings</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-200 text-center">
        <p className="text-[11px] text-slate-400">CivicShield Security v1.0.0</p>
        <p className="text-[10px] text-slate-400">Role-Based Access Control</p>
      </div>
    </aside>
  );
};
