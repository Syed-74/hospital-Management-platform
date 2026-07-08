import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard,
  Settings, 
  LogOut, 
  Menu,
  X,
  Hospital,
  Bell,
  Stethoscope
} from 'lucide-react';

export default function HospitalDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout, userPermissions, user } = useAuth();
  const [hospitalLogo, setHospitalLogo] = useState("")

  React.useEffect(() => {
    if (user?.hospital?.logo) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';
      const logoPath = user.hospital.logo.startsWith('/') ? user.hospital.logo : `/${user.hospital.logo}`;
      setHospitalLogo(user.hospital.logo.startsWith('http') ? user.hospital.logo : `${baseUrl}${logoPath}`);
    }
  }, [user]);

  // Dynamic Navigation Config mapped to permissions
  const NAVIGATION_CONFIG = [
    { 
      name: 'Overview', 
      href: '/company/overview', 
      icon: LayoutDashboard, 
      requiredPermissions: ['hospital:access'] 
    },
    { 
      name: 'Patients', 
      href: '/company/patients', 
      icon: Stethoscope, 
      requiredPermissions: ['patients:manage', 'patients:read'] 
    },
    { 
      name: 'Staff Management', 
      href: '/company/staff', 
      icon: Users, 
      requiredPermissions: ['hospitalUsers:manage', 'hospitalUsers:read'] 
    },
    { 
      name: 'Billing', 
      href: '/company/billing', 
      icon: CreditCard, 
      requiredPermissions: ['billing:manage', 'billing:read'] 
    },
    { 
      name: 'Settings', 
      href: '/company/settings', 
      icon: Settings, 
      requiredPermissions: ['hospital:access'] 
    },
  ];

  // Filter navigation items based on user's permissions
  const authorizedNavigation = NAVIGATION_CONFIG.filter(item => {
    // If no specific permissions are required, show it
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) return true;
    // Check if user has at least one of the required permissions
    return item.requiredPermissions.some(perm => userPermissions.includes(perm));
  });

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:w-64 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          {hospitalLogo ? (
            <img src={hospitalLogo} alt="Hospital Logo" className="h-8 w-8 object-contain mr-2 rounded" />
          ) : (
            <Hospital className="h-8 w-8 text-indigo-600 mr-2" />
          )}
          
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900 tracking-tight leading-tight">Hospital Admin</span>
            <span className="text-xs text-indigo-600 font-semibold truncate max-w-[150px]">{user?.hospital?.hospitalName || 'Hospital Admin'}</span>
          </div>
          <button 
            className="ml-auto lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {authorizedNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive(item.href) 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
              `}
            >
              <item.icon 
                className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-indigo-700' : 'text-gray-400'}`} 
              />
              {item.name}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={logout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            <button className="p-2 text-gray-400 hover:text-gray-500 transition-colors relative">
              <Bell size={20} />
            </button>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 border border-indigo-200 font-bold uppercase">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
