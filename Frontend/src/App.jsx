import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './core/context/AuthContext';
import Login from './modules/auth/Login';
import Register from './modules/auth/Register';
import ForgotPassword from './modules/auth/ForgotPassword';
import PlatformDashboard from './modules/PlatformAdmin/PlatformDashboard';
import Overview from './modules/PlatformAdmin/Overview';
import ManageAdmin from './modules/PlatformAdmin/ManageAdmin';
import Settings from './modules/PlatformAdmin/Settings';
import CreatingHospital from './modules/PlatformAdmin/CreatingHospital';
import ProtectedRoute from './core/components/ProtectedRoute';

// Hospital Admin / Tenant Modules
import HospitalDashboard from './modules/HospitalAdmin/HospitalDashboard';
import HospitalOverview from './modules/HospitalAdmin/Overview';
import StaffManagement from './modules/HospitalAdmin/StaffManagement';

// Role Dashboards (To be implemented for HMS)
// import DoctorDashboard from './pages/Dashboard/Doctor/DoctorDashboard';
// import NurseDashboard from './pages/Dashboard/Nurse/NurseDashboard';
import { useAuth } from './core/context/AuthContext';
import ThemeManagement from './modules/PlatformAdmin/ThemeManagement';
import { ThemeProvider } from './core/context/ThemeProvider';

const RootRedirect = () => {
  const { user, token, loading } = useAuth();
  if (loading) return null;
  if (!token || !user) return <Navigate to="/login" replace />;
  const roleWithDefaultPath = user.roles?.find(role => role.defaultPath);
  return <Navigate to={roleWithDefaultPath?.defaultPath || "/login"} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Dashboards */}
          <Route 
            path="/platformAdmin" 
            element={
              <ProtectedRoute requiredPermissions={['platform:access']}>
                <PlatformDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/platformAdmin/overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="manage-admin" element={<ManageAdmin />} />
            <Route path="company-management" element={<CreatingHospital/>} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/platformAdmin/overview" replace />} />
            <Route path="theme-management" element={<ThemeManagement/>} />
          </Route>

          {/* Hospital / Tenant Admin Routes */}
          <Route 
            path="/company" 
            element={
              <ProtectedRoute requiredPermissions={['hospital:access']}>
                <ThemeProvider>
                  <HospitalDashboard />
                </ThemeProvider>
              </ProtectedRoute>
            } 
          >
            <Route index element={<Navigate to="/company/overview" replace />} />
            <Route path="overview" element={<HospitalOverview />} />
            <Route path="staff" element={<StaffManagement />} />
            {/* Additional placeholders can be added here as needed, matching the NAVIGATION_CONFIG */}
            <Route path="*" element={<Navigate to="/company/overview" replace />} />
          </Route>


          {/* Default Redirection Route */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;