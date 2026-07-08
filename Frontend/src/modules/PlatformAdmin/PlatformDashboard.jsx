import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Hospital,
  Bell,
  User
} from 'lucide-react';
import Button from '../../core/components/ui/Button';

export default function PlatformDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Overview', href: '/platformAdmin/overview', icon: LayoutDashboard },
    { name: 'Manage Hospital', href: '/platformAdmin/company-management', icon: Building2 },
    { name: 'Manage Admin ', href: '/platformAdmin/manage-admin', icon: Building2 },
    { name: 'Subscription', href: '/platformAdmin/companies', icon: Building2 },
    { name: 'Settings', href: '/platformAdmin/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

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
          <Hospital className="h-8 w-8 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">Platform Admin</span>
          <button 
            className="ml-auto lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive(item.href) 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
              `}
            >
              <item.icon 
                className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-blue-700' : 'text-gray-400'}`} 
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
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 border border-blue-200">
              <User size={18} />
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