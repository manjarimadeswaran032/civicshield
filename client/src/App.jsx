import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { RoleRoute } from './components/common/RoleRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { PublicTrackingPage } from './pages/public/PublicTrackingPage';
import { SecurityPrivacyPage } from './pages/public/SecurityPrivacyPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ContactHelpPage } from './pages/public/ContactHelpPage';
import { AccessibilityPage } from './pages/public/AccessibilityPage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { ReportComplaintPage } from './pages/citizen/ReportComplaintPage';
import { MyComplaintsPage } from './pages/citizen/MyComplaintsPage';
import { ComplaintDetailPage } from './pages/citizen/ComplaintDetailPage';
import { NotificationsPage } from './pages/citizen/NotificationsPage';
import { ProfilePage } from './pages/citizen/ProfilePage';

// Officer & Manager Pages
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { ComplaintManagementPage } from './pages/officer/ComplaintManagementPage';
import { OfficerComplaintDetailPage } from './pages/officer/OfficerComplaintDetailPage';
import { ReopenedComplaintsPage } from './pages/officer/ReopenedComplaintsPage';
import { EscalatedComplaintsPage } from './pages/officer/EscalatedComplaintsPage';
import { DepartmentAnalyticsPage } from './pages/officer/DepartmentAnalyticsPage';

// Administrator Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { RolePermissionPage } from './pages/admin/RolePermissionPage';
import { DepartmentManagementPage } from './pages/admin/DepartmentManagementPage';
import { CategoryManagementPage } from './pages/admin/CategoryManagementPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { SecurityEventsPage } from './pages/admin/SecurityEventsPage';
import { SystemAnalyticsPage } from './pages/admin/SystemAnalyticsPage';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage';

export default function App() {
  const location = useLocation();
  const isPortalRoute = location.pathname.startsWith('/citizen') ||
                        location.pathname.startsWith('/officer') ||
                        location.pathname.startsWith('/manager') ||
                        location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <div className="flex-1 flex">
        {isPortalRoute && <Sidebar />}

        <main className={`flex-1 ${isPortalRoute ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full' : ''}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/track" element={<PublicTrackingPage />} />
            <Route path="/security" element={<SecurityPrivacyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/contact" element={<ContactHelpPage />} />
            <Route path="/accessibility" element={<AccessibilityPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />

            {/* Citizen Portal Routes */}
            <Route path="/citizen/dashboard" element={<ProtectedRoute><RoleRoute allowedRoles={['citizen', 'admin']}><CitizenDashboard /></RoleRoute></ProtectedRoute>} />
            <Route path="/citizen/report" element={<ProtectedRoute><RoleRoute allowedRoles={['citizen', 'admin']}><ReportComplaintPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/citizen/my-complaints" element={<ProtectedRoute><RoleRoute allowedRoles={['citizen', 'admin']}><MyComplaintsPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/citizen/complaints/:id" element={<ProtectedRoute><RoleRoute allowedRoles={['citizen', 'admin']}><ComplaintDetailPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/citizen/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/citizen/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Officer & Manager Portal Routes */}
            <Route path="/officer/dashboard" element={<ProtectedRoute><RoleRoute allowedRoles={['officer', 'manager', 'admin']}><OfficerDashboard /></RoleRoute></ProtectedRoute>} />
            <Route path="/officer/complaints" element={<ProtectedRoute><RoleRoute allowedRoles={['officer', 'manager', 'admin']}><ComplaintManagementPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/officer/complaints/:id" element={<ProtectedRoute><RoleRoute allowedRoles={['officer', 'manager', 'admin']}><OfficerComplaintDetailPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/officer/reopened" element={<ProtectedRoute><RoleRoute allowedRoles={['officer', 'manager', 'admin']}><ReopenedComplaintsPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/officer/escalated" element={<ProtectedRoute><RoleRoute allowedRoles={['officer', 'manager', 'admin']}><EscalatedComplaintsPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/officer/analytics" element={<ProtectedRoute><RoleRoute allowedRoles={['officer', 'manager', 'admin']}><DepartmentAnalyticsPage /></RoleRoute></ProtectedRoute>} />

            {/* Manager Aliases */}
            <Route path="/manager/dashboard" element={<Navigate to="/officer/dashboard" replace />} />
            <Route path="/manager/complaints" element={<Navigate to="/officer/complaints" replace />} />
            <Route path="/manager/analytics" element={<Navigate to="/officer/analytics" replace />} />

            {/* Administrator Portal Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><UserManagementPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/admin/roles" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><RolePermissionPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/admin/departments" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><DepartmentManagementPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><CategoryManagementPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/admin/audit-logs" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><AuditLogsPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/admin/security-events" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><SecurityEventsPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><SystemAnalyticsPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><SystemSettingsPage /></RoleRoute></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {!isPortalRoute && <Footer />}
    </div>
  );
}
