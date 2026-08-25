import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Bell, User, LogOut, Search, Menu, X, PlusCircle, LayoutDashboard, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const Navbar = () => {
  const { user, logout, isCitizen, isOfficer, isManager, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isAdmin()) return '/admin/dashboard';
    if (isManager()) return '/manager/dashboard';
    if (isOfficer()) return '/officer/dashboard';
    return '/citizen/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Identity */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-950 via-slate-800 to-brand-700 bg-clip-text text-transparent">
                  CivicShield
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 rounded-full border border-brand-200">
                  Municipal Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`text-sm font-medium transition ${location.pathname === '/' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}>
              Home
            </Link>
            <Link to="/how-it-works" className={`text-sm font-medium transition ${location.pathname === '/how-it-works' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}>
              How It Works
            </Link>
            <Link to="/track" className={`text-sm font-medium transition ${location.pathname === '/track' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}>
              Track Complaint
            </Link>
            <Link to="/security" className={`text-sm font-medium transition ${location.pathname === '/security' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}>
              Security & RBAC
            </Link>
            <Link to="/about" className={`text-sm font-medium transition ${location.pathname === '/about' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}>
              About
            </Link>
          </nav>

          {/* Right Action Icons & User Info */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {isCitizen() && (
                  <Link
                    to="/citizen/report"
                    className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition shadow-brand-500/25"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Report Issue</span>
                  </Link>
                )}

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <h4 className="font-bold text-slate-900 text-sm">Notifications ({unreadCount} unread)</h4>
                        <Link
                          to={isCitizen() ? "/citizen/notifications" : "/citizen/notifications"}
                          onClick={() => setShowNotifications(false)}
                          className="text-xs text-brand-600 font-semibold hover:underline"
                        >
                          View All
                        </Link>
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-slate-500">No new notifications</div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                if (n.link) navigate(n.link);
                                setShowNotifications(false);
                              }}
                              className={`p-3.5 hover:bg-slate-50 transition cursor-pointer ${!n.isRead ? 'bg-brand-50/40 font-medium' : ''}`}
                            >
                              <div className="flex items-start justify-between">
                                <p className="text-xs font-bold text-slate-900">{n.title}</p>
                                <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition border border-slate-200"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs font-bold uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden md:inline-block text-xs font-bold text-slate-700 max-w-[100px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fade-in">
                      <div className="p-3 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 rounded-md border border-brand-200">
                          {user.role}
                        </span>
                      </div>
                      <div className="py-1">
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50"
                        >
                          <LayoutDashboard className="w-4 h-4 text-brand-600" />
                          <span>Portal Dashboard</span>
                        </Link>
                        {isCitizen() && (
                          <Link
                            to="/citizen/my-complaints"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50"
                          >
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span>My Complaints</span>
                          </Link>
                        )}
                        <Link
                          to="/citizen/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Profile & Security</span>
                        </Link>
                      </div>
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-xs font-semibold text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition shadow-brand-500/25"
                >
                  Citizen Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Home</Link>
          <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">How It Works</Link>
          <Link to="/track" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Track Complaint</Link>
          <Link to="/security" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Security & RBAC</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">About</Link>
          {user && (
            <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-bold text-brand-600 bg-brand-50">
              Go to Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
