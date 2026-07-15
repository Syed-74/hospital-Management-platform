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
  User,
  Palette
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
    { name: 'Permission ', href: '/platformAdmin/roles/:roleId/permissions', icon: Building2 },
    // { name: 'Theme Management', href: '/platformAdmin/theme-management', icon: Palette },
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
        <div className="h-[72px] flex items-center px-6 border-b border-gray-100">
          <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <Hospital className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-gray-900 tracking-tight leading-none">MediFlow ERP</span>
            <span className="text-xs font-medium text-gray-500 mt-1">Platform Admin</span>
          </div>
          <button 
            className="ml-auto lg:hidden text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-md transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                group flex items-center px-6 py-3 text-sm font-semibold transition-all relative
                ${isActive(item.href) 
                  ? 'text-teal-700 bg-teal-50/70' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              {isActive(item.href) && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-teal-700" />
              )}
              <item.icon 
                className={`mr-4 h-5 w-5 transition-colors ${isActive(item.href) ? 'text-teal-700' : 'text-gray-400 group-hover:text-gray-500'}`} 
              />
              {item.name}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50 hover:text-red-600 transition-colors group"
          >
            <LogOut className="mr-4 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-[72px] bg-white border-b border-gray-200/80 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center space-x-5 ml-auto">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all relative group">
              <Bell size={20} className="group-hover:animate-swing origin-top" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            
            <div className="h-9 w-9 rounded-md bg-teal-50 flex items-center justify-center text-teal-700 font-bold uppercase border border-teal-100 cursor-pointer hover:ring-2 hover:ring-teal-500/20 transition-all">
              {user?.firstName ? user.firstName.charAt(0) : <User size={18} />}
              {user?.lastName ? user.lastName.charAt(0) : ''}
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