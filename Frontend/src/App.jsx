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

// Role Dashboards (To be implemented for HMS)
// import DoctorDashboard from './pages/Dashboard/Doctor/DoctorDashboard';
// import NurseDashboard from './pages/Dashboard/Nurse/NurseDashboard';
import { useAuth } from './core/context/AuthContext';
// import ThemeManagement from './modules/PlatformAdmin/ThemeManagement';
import { ThemeProvider } from './core/context/ThemeProvider';
import ManageBranch from './modules/HospitalAdmin/ManageBranch';
import Permission from './modules/auth/Permission';
import ManageBranchAdmin from './modules/HospitalAdmin/ManageBranchAdmin';
import BranchAdminDashboard from './modules/BranchAdmin/branchAdminDashboard';
import BranchDashboard from './modules/BranchAdmin/BranchDashboard';
import { Outlet } from 'react-router-dom';

const RootRedirect = () => {
  const { user, token, loading } = useAuth();
  if (loading) return null;
  if (!token || !user) return <Navigate to="/login" replace />;
  
  const roleWithDashboard = user.roles?.find(role => role.roleDashboards?.length > 0);
  
  if (roleWithDashboard) {
    return <Navigate to={roleWithDashboard.roleDashboards[0].dashboard.path} replace />;
  }

  // Fallback routing based on permissions if dashboard mapping is missing
  const userPermissions = user.roles?.flatMap(role => 
    role.rolePermissions?.map(p => p.permission.action) || []
  ) || [];

  if (userPermissions.includes("platform:access")) return <Navigate to="/platformAdmin/overview" replace />;
  if (userPermissions.includes("hospital:access")) return <Navigate to="/hospital/overview" replace />;
  if (userPermissions.includes("branch:access")) return <Navigate to="/branch/dashboard" replace />;

  return <Navigate to="/login" replace />;
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
            <Route path="hospital-management" element={<CreatingHospital/>} />
            <Route path="roles/:roleId/permissions" element={<Permission mode="platform" />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/platformAdmin/overview" replace />} />
            {/* <Route path="theme-management" element={<ThemeManagement/>} /> */}
          </Route>

          {/* Hospital / Tenant Admin Routes */}
          <Route 
            path="/hospital" 
            element={
              <ProtectedRoute requiredPermissions={['hospital:access']}>
                <ThemeProvider>
                  <HospitalDashboard />
                </ThemeProvider>
              </ProtectedRoute>
            } 
          >
            <Route index element={<Navigate to="/hospital/overview" replace />} />
            <Route path="overview" element={<HospitalOverview />} />
            <Route path="roles-permissions" element={<Permission mode="tenant" />} />
            <Route path="branch/manage" element={<ManageBranch />} />
            <Route path="manage-branch-admin" element={<ManageBranchAdmin/>} />
            <Route path="*" element={<Navigate to="/hospital/overview" replace />} />
          </Route>
           
          {/* Branch admin  / Tenant Admin Routes */}
          <Route 
            path="/branch" 
            element={
              <ProtectedRoute requiredPermissions={['branch:access']}>
                <ThemeProvider>
                  <BranchDashboard />
                </ThemeProvider>
              </ProtectedRoute>
            } 
          >
            <Route index element={<Navigate to="/branch/dashboard" replace />} />
            <Route path="dashboard" element={<BranchAdminDashboard />} />
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