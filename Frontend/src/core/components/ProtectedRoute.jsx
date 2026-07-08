import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredPermissions }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  // If AuthContext is still fetching user profile, show nothing or a spinner
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // 1. Check if user is authenticated at all
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check Dynamic RBAC Permissions
  // If requiredPermissions is provided, verify the user has at least one of those permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    // Extract all permission actions from the user's assigned roles
    const userPermissions = user.roles?.flatMap(role => 
      role.permissions?.map(p => p.action) || []
    ) || [];
    
    const hasPermission = requiredPermissions.some(permission => userPermissions.includes(permission));
    
    if (!hasPermission) {
      // User is authenticated but lacks required permission.
      // Redirect to a safe fallback defined in the database (defaultPath).
      const roleWithDefaultPath = user.roles?.find(role => role.defaultPath);
      const redirectPath = roleWithDefaultPath?.defaultPath || '/login';
      
      // Prevent infinite redirect loop if they are already on their default path but lack specific permissions
      if (location.pathname.startsWith(redirectPath) || location.pathname === redirectPath) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">403 Forbidden</h1>
            <p className="text-gray-600 mb-6">You do not have the required permissions to access this page.</p>
            <p className="text-sm text-gray-500">Please contact your administrator or refresh your session.</p>
          </div>
        );
      }

      return <Navigate to={redirectPath} replace />;
    }
  }

  // 3. User is authorized
  return children;
}