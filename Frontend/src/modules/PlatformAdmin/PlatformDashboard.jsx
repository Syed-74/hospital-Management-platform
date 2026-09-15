import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  Users,
  ShieldCheck,
  CreditCard,
  Settings, 
  LogOut, 
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Crown
} from 'lucide-react';

export default function PlatformDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Overview', href: '/platformAdmin/overview', icon: LayoutDashboard },
    { name: 'Manage Hospital', href: '/platformAdmin/hospital-management', icon: Building2 },
    { name: 'Manage Admin', href: '/platformAdmin/manage-admin', icon: Users },
    { name: 'Permission', href: '/platformAdmin/roles/:roleId/permissions', icon: ShieldCheck },
    { name: 'Subscription', href: '/platformAdmin/subscriptions', icon: CreditCard },
    { name: 'Settings', href: '/platformAdmin/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans antialiased">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:w-64 flex flex-col justify-between shadow-[1px_0_10px_rgba(0,0,0,0.02)]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white mr-3 shadow-sm shadow-teal-600/30">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 tracking-tight leading-snug">Hospital Management</span>
              <span className="text-xs font-medium text-slate-400">System</span>
            </div>
            <button 
              className="ml-auto lg:hidden text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-md transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150
                    ${active 
                      ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20' 
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}
                  `}
                >
                  <item.icon 
                    className={`mr-3.5 h-4 w-4 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} 
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Admin Crown Card */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Crown className="w-4 h-4 fill-amber-500" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">Platform Admin</p>
              <p className="text-[11px] text-slate-500 truncate">Super Administrator</p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button 
            onClick={handleSignOut}
            className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors group"
          >
            <LogOut className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 sticky top-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center space-x-4 flex-1 max-w-xl">
            <button
              className="lg:hidden text-slate-500 hover:text-slate-700 focus:outline-none p-1"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Global Search Bar */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search hospitals, admins, reports..."
                className="w-full pl-10 pr-4 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200/80 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
              <Bell size={18} />
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                3
              </span>
            </button>
            
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* User Profile Badge */}
            <div className="flex items-center space-x-2.5 cursor-pointer group hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'S'}
                {user?.lastName ? user.lastName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Super Admin'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Platform Administrator</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
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