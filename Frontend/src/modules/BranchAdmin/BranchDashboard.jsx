import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext';
import { useTheme } from '../../core/context/ThemeProvider';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Users, 
  Calendar, 
  Settings, 
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Hospital,
  Bell,
  LogOut,
  ChevronLeft
} from 'lucide-react';

export default function BranchDashboard() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const location = useLocation();
  const { logout, user, userPermissions } = useAuth();
  const { theme } = useTheme();
  const [hospitalLogo, setHospitalLogo] = useState("");

  React.useEffect(() => {
    if (user?.hospital?.logo) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';
      const logoPath = user.hospital.logo.startsWith('/') ? user.hospital.logo : `/${user.hospital.logo}`;
      setHospitalLogo(user.hospital.logo.startsWith('http') ? user.hospital.logo : `${baseUrl}${logoPath}`);
    }
  }, [user]);

  const NAVIGATION_CONFIG = [
    {
      category: 'Overview Dashboard',
      isSingle: true,
      name: 'Branch Dashboard',
      href: '/branch/dashboard',
      icon: LayoutDashboard,
      requiredPermissions: ['branch:access']
    },
    {
      category: 'Clinical Administration',
      icon: Stethoscope,
      items: [
        { name: 'Doctors', href: '/branch/doctors', requiredPermissions: ['doctors:read', 'doctors:manage'] },
        { name: 'Patients', href: '/branch/patients', requiredPermissions: ['patients:read', 'patients:manage'] },
        { name: 'Appointments', href: '/branch/appointments', requiredPermissions: ['appointments:read', 'appointments:manage'] }
      ]
    },
    {
      category: 'Branch Operations',
      icon: Settings,
      items: [
        { name: 'Settings', href: '/branch/settings', requiredPermissions: ['branch_settings:read', 'branch_settings:manage'] }
      ]
    }
  ];

  const hasPermission = (permissions) => {
    if (!permissions || permissions.length === 0) return true;
    return permissions.some(perm => userPermissions.includes(perm));
  };

  const [expandedCategories, setExpandedCategories] = useState({
    'Clinical Administration': true,
    'Branch Operations': false
  });

  const isActive = (path) => location.pathname === path;

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, idx) => {
      const href = '/' + paths.slice(0, idx + 1).join('/');
      const label = path
        .replace(/-/g, ' ')
        .replace('branch', 'Branch Portal')
        .replace(/\b\w/g, c => c.toUpperCase());
      return { label, href, isLast: idx === paths.length - 1 };
    });
  };

  const isMini = theme?.miniSidebar || (theme?.collapsibleSidebar && desktopCollapsed);
  const headerTextColor = theme?.headerTextColor || '#111827';

  return (
    <div className="min-h-screen bg-gray-50/50 flex font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 border-r transform transition-all duration-300 ease-out lg:translate-x-0 lg:static flex flex-col shadow-sm lg:shadow-none shrink-0
          bg-white border-gray-200
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMini ? 'w-20' : 'w-80'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-[72px] flex items-center px-6 border-b border-gray-100 shrink-0 relative overflow-hidden">
          {(theme?.showHospitalLogo ?? true) && (
            hospitalLogo ? (
              <img src={hospitalLogo} alt="Hospital Logo" className="h-8 w-8 object-contain rounded-lg shadow-sm" />
            ) : (
              <Hospital className="h-8 w-8 shrink-0 text-theme-primary" />
            )
          )}
          
          {!isMini && (theme?.showHospitalName ?? true) && (
            <div className="flex flex-col overflow-hidden text-left ml-3">
              <span className="text-sm font-extrabold tracking-tight leading-tight truncate text-gray-900">
                {user?.branchAdmin?.branch?.branchName || user?.hospital?.hospitalName || 'Branch Portal'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5 text-theme-primary">
                {user?.branchAdmin?.branch?.branchCode || 'BRANCH'}
              </span>
            </div>
          )}

          {!mobileSidebarOpen && theme?.collapsibleSidebar && !theme?.miniSidebar && (
            <button 
              onClick={() => setDesktopCollapsed(!desktopCollapsed)}
              className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-50 border border-theme-border text-gray-400 bg-white"
            >
              {desktopCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
          
          <button 
            className="ml-auto lg:hidden p-1 rounded-lg hover:bg-gray-50 text-gray-500"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-3">
          {NAVIGATION_CONFIG.map((group) => {
            if (group.isSingle) {
              if (!hasPermission(group.requiredPermissions)) return null;
              
              const active = isActive(group.href);
              return (
                <Link
                  key={group.name}
                  to={group.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`
                    group flex items-center text-xs font-bold uppercase tracking-wider transition-all rounded-xl relative
                    ${isMini ? 'justify-center p-3' : 'px-6 py-3'}
                    ${active 
                      ? 'text-theme-primary bg-theme-primary/10' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  {active && !isMini && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-theme-primary" />
                  )}
                  <group.icon className={`shrink-0 ${isMini ? 'h-5.5 w-5.5' : 'mr-3 h-4 w-4'} ${active ? 'text-theme-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  {!isMini && <span>{group.name}</span>}
                </Link>
              );
            }

            const isExpanded = expandedCategories[group.category];
            const CategoryIcon = group.icon;

            const allowedItems = group.items.filter(item => hasPermission(item.requiredPermissions));
            if (allowedItems.length === 0) return null;

            return (
              <div key={group.category} className="space-y-1">
                <button
                  onClick={() => !isMini && toggleCategory(group.category)}
                  className={`
                    w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider rounded-xl transition-all
                    ${isMini 
                      ? 'justify-center p-3 hover:bg-gray-50' 
                      : 'px-6 py-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'}
                  `}
                >
                  <div className="flex items-center">
                    <CategoryIcon className={`shrink-0 ${isMini ? 'h-5.5 w-5.5' : 'mr-3 h-4 w-4'} text-gray-400`} />
                    {!isMini && <span>{group.category}</span>}
                  </div>
                  {!isMini && (
                    isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />
                  )}
                </button>

                {isExpanded && !isMini && (
                  <div className="pl-7 space-y-1 border-l border-gray-200 ml-6 mt-1">
                    {allowedItems.map((subItem) => {
                      const active = isActive(subItem.href);
                      return (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          onClick={() => setMobileSidebarOpen(false)}
                          className={`
                            block py-1.5 px-3 rounded-lg text-xs font-semibold transition-all relative
                            ${active 
                              ? 'text-theme-primary bg-theme-primary/5 font-bold' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'}
                          `}
                        >
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <button 
            onClick={logout}
            className={`flex items-center rounded-xl text-sm font-semibold text-theme-error hover:bg-theme-error/10 transition-colors group relative ${
              isMini ? 'justify-center p-3' : 'px-4 py-3 w-full'
            }`}
          >
            <LogOut className={`shrink-0 ${isMini ? 'h-5.5 w-5.5' : 'mr-4 h-5 w-5'} text-gray-400 group-hover:text-theme-error transition-colors`} />
            {!isMini && <span>Sign Out</span>}
            {isMini && (
              <span className="absolute left-16 bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-md">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-[72px] border-b flex items-center justify-between px-6 z-30 shrink-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] bg-theme-header border-theme-border">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden focus:outline-none p-1 rounded-lg hover:bg-gray-50 text-theme-header-text"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            <nav className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-slate-400">
              {getBreadcrumbs().map((bc, idx) => (
                <React.Fragment key={bc.href}>
                  {idx > 0 && <ChevronRight size={14} className="text-slate-300 shrink-0" />}
                  {bc.isLast ? (
                    <span style={{ color: headerTextColor }}>{bc.label}</span>
                  ) : (
                    <Link to={bc.href} className="hover:text-gray-600 transition-colors">{bc.label}</Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 transition-colors relative rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-600">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl transition-all hover:bg-gray-50"
              >
                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center border font-bold uppercase text-xs text-theme-primary border-theme-border">
                  {user?.firstName?.charAt(0) || 'A'}
                  {user?.lastName?.charAt(0) || ''}
                </div>
                <div className="hidden md:flex flex-col text-left shrink-0">
                  <span className="text-xs font-bold leading-none text-theme-header-text">{user?.firstName || 'Admin'} {user?.lastName || ''}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Branch Admin</span>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden md:block" />
              </button>

              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-200/60 p-1.5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="px-3.5 py-2.5 border-b border-gray-100 shrink-0">
                      <span className="text-xs font-semibold text-slate-400 block">Logged in as</span>
                      <span className="text-xs font-bold text-slate-700 block truncate mt-0.5">{user?.email || 'admin@branch.com'}</span>
                    </div>
                    <button onClick={logout} className="flex items-center w-full px-3 py-2 text-xs font-bold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors mt-1">
                      <LogOut className="w-4 h-4 mr-2.5 text-rose-500" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
