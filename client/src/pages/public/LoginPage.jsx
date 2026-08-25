import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, Key, AlertTriangle, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleLoginSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const user = await login(email, password);

    if (!user) {
      throw new Error('Login succeeded but user information was not returned.');
    }

    if (from) {
      navigate(from, { replace: true });
    } else {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'manager') navigate('/manager/dashboard');
      else if (user.role === 'officer') navigate('/officer/dashboard');
      else navigate('/citizen/dashboard');
    }
  } catch (err) {
    setError(err.message || 'Login failed. Please check credentials.');
  } finally {
    setLoading(false);
  }
};
  
  const handleDemoLogin = async (demoEmail, demoPassword) => {
  setEmail(demoEmail);
  setPassword(demoPassword);
  setError(null);
  setLoading(true);

  try {
    const user = await login(demoEmail, demoPassword);

    if (!user) {
      throw new Error('Login succeeded but user information was not returned.');
    }

    if (user.role === 'admin') navigate('/admin/dashboard');
    else if (user.role === 'manager') navigate('/manager/dashboard');
    else if (user.role === 'officer') navigate('/officer/dashboard');
    else navigate('/citizen/dashboard');

  } catch (err) {
    setError(err.message || 'Login failed.');
  } finally {
    setLoading(false);
  }
};
  
  return (
    <div className="py-12 bg-slate-50 min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">CivicShield Authentication</h2>
          <p className="text-xs text-slate-500">Secure municipal login with Role-Based Access Control</p>
        </div>

        {/* 1-Click Demo Evaluation Box */}
        <div className="p-4 bg-brand-50/70 border border-brand-200 rounded-2xl space-y-2">
          <p className="text-xs font-bold text-brand-900 flex items-center">
            <UserCheck className="w-4 h-4 mr-1.5 text-brand-600" />
            1-Click Demo Evaluation Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@civicshield.gov', 'Admin@123456')}
              className="px-2.5 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              👑 Admin Login
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('manager.roads@civicshield.gov', 'Manager@123456')}
              className="px-2.5 py-1.5 text-xs font-bold bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition"
            >
              🏢 Manager Login
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('officer.sharma@civicshield.gov', 'Officer@123456')}
              className="px-2.5 py-1.5 text-xs font-bold bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition"
            >
              👮 Officer Login
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('citizen.rahul@example.com', 'Citizen@123456')}
              className="px-2.5 py-1.5 text-xs font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition"
            >
              👤 Citizen Login
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-brand-500/25 flex items-center justify-center space-x-2"
            >
              {loading ? <span>Authenticating...</span> : <><span>Log In to CivicShield</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:underline">
                Register as Citizen
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
