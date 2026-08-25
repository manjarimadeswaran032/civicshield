import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.get('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Session check failed:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await api.post('/auth/login', { email, password });
      if (data.token) {
        setAuthToken(data.token);
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const data = await api.post('/auth/register', userData);
      if (data.token) {
        setAuthToken(data.token);
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (getAuthToken()) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // ignore
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const data = await api.put('/auth/profile', profileData);
    if (data.user) {
      setUser(prev => ({ ...prev, ...data.user }));
    }
    return data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await api.put('/auth/change-password', { currentPassword, newPassword });
  };

  // RBAC Helper functions
  const hasRole = (role) => user && user.role === role;
  const hasAnyRole = (...roles) => user && roles.includes(user.role);
  const isCitizen = () => hasRole('citizen');
  const isOfficer = () => hasRole('officer');
  const isManager = () => hasRole('manager');
  const isAdmin = () => hasRole('admin');

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      hasRole,
      hasAnyRole,
      isCitizen,
      isOfficer,
      isManager,
      isAdmin,
      refreshUser: checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
