import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext';
import { useTheme } from '../../core/context/ThemeProvider';
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
  Stethoscope,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  User
} from 'lucide-react';

export default function HospitalDashboard() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const location = useLocation();
  const { logout, userPermissions, user } = useAuth();
  const { theme } = useTheme();
  const [hospitalLogo, setHospitalLogo] = useState("");

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
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) return true;
    return item.requiredPermissions.some(perm => userPermissions.includes(perm));
  });

  const isActive = (path) => location.pathname.startsWith(path);

  // Generate dynamic breadcrumbs for the hospital dashboard
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, idx) => {
      const href = '/' + paths.slice(0, idx + 1).join('/');
      const label = path
        .replace(/-/g, ' ')
        .replace('company', 'Hospital Portal')
        .replace(/\b\w/g, c => c.toUpperCase());
      return { label, href, isLast: idx === paths.length - 1 };
    });
  };

  // Determine actual sidebar width state
  const isMini = theme?.miniSidebar || (theme?.collapsibleSidebar && desktopCollapsed);

  return (
    <div className="min-h-screen bg-theme-bg flex font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 border-r transform transition-all duration-300 ease-out lg:translate-x-0 lg:static flex flex-col shadow-xl lg:shadow-none shrink-0
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMini ? 'w-20' : 'w-72'}
        `}
        style={{ 
          backgroundColor: theme?.sidebarColor || '#FFFFFF', 
          borderColor: theme?.borderColor || 'var(--color-border)' 
        }}
      >
        {/* Sidebar Header */}
        <div 
          className="h-16 flex items-center px-4 border-b shrink-0 relative overflow-hidden"
          style={{ borderBottomColor: theme?.borderColor || 'var(--color-border)' }}
        >
          {/* Logo element */}
          {(theme?.showHospitalLogo ?? true) && (
            hospitalLogo ? (
              <img src={hospitalLogo} alt="Hospital Logo" className="h-8 w-8 object-contain rounded-lg shadow-sm" />
            ) : (
              <Hospital className="h-8 w-8 shrink-0" style={{ color: theme?.primaryColor || 'var(--color-primary)' }} />
            )
          )}
          
          {/* Text Title (only if not mini) */}
          {!isMini && (theme?.showHospitalName ?? true) && (
            <div className="flex flex-col overflow-hidden text-left ml-3">
              <span className="text-sm font-extrabold tracking-tight leading-tight truncate" style={{ color: theme?.sidebarTextColor || 'var(--color-sidebar-text)' }}>
                {user?.hospital?.hospitalName || 'Tenant Portal'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: theme?.primaryColor || 'var(--color-primary)' }}>
                {user?.hospital?.hospitalCode || 'HOSP'}
              </span>
            </div>
          )}

          {/* Desktop Collapse Toggle (only if collapsibleSidebar is enabled) */}
          {!mobileSidebarOpen && theme?.collapsibleSidebar && !theme?.miniSidebar && (
            <button 
              onClick={() => setDesktopCollapsed(!desktopCollapsed)}
              className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-100/80 border text-slate-400 border-slate-200 bg-white"
            >
              {desktopCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
          
          <button 
            className="ml-auto lg:hidden p-1 rounded-lg hover:bg-slate-100"
            style={{ color: theme?.sidebarTextColor || 'var(--color-sidebar-text)' }}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {authorizedNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={`
                flex items-center rounded-xl text-sm font-semibold transition-all duration-200 group relative
                ${isMini ? 'justify-center p-3' : 'px-3.5 py-2.5'}
                ${isActive(item.href) 
                  ? 'bg-theme-primary/10 text-theme-primary shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
              `}
              style={{
                color: isActive(item.href) ? theme?.primaryColor || 'var(--color-primary)' : undefined
              }}
            >
              <item.icon 
                className={`shrink-0 ${isMini ? 'h-5.5 w-5.5' : 'mr-3 h-5 w-5'}`}
                style={{ 
                  color: isActive(item.href) 
                    ? theme?.primaryColor || 'var(--color-primary)' 
                    : '#94A3B8' 
                }} 
              />
              
              {!isMini && <span>{item.name}</span>}

              {/* Tooltip on mini sidebar hover */}
              {isMini && (
                <span className="absolute left-16 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-md">
                  {item.name}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Sidebar Footer Logout */}
        <div 
          className="p-4 border-t"
          style={{ borderTopColor: theme?.borderColor || 'var(--color-border)' }}
        >
          <button 
            onClick={logout}
            className={`flex items-center rounded-xl text-sm font-semibold text-theme-error hover:bg-theme-error/10 transition-colors group relative ${
              isMini ? 'justify-center p-3' : 'px-3.5 py-2.5 w-full'
            }`}
          >
            <LogOut className={`shrink-0 ${isMini ? 'h-5.5 w-5.5' : 'mr-3 h-5 w-5'}`} />
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
        <header 
          className={`h-16 border-b flex items-center justify-between px-6 z-30 shrink-0 ${
            theme?.fixedHeader ? 'sticky top-0' : 'relative'
          }`}
          style={{ 
            backgroundColor: theme?.headerColor || '#FFFFFF', 
            borderColor: theme?.borderColor || 'var(--color-border)' 
          }}
        >
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden focus:outline-none p-1 rounded-lg hover:bg-slate-100"
              style={{ color: theme?.headerTextColor || 'var(--color-header-text)' }}
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Dynamic Breadcrumbs */}
            <nav className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-slate-400">
              {getBreadcrumbs().map((bc, idx) => (
                <React.Fragment key={bc.href}>
                  {idx > 0 && <ChevronRight size={14} className="text-slate-300 shrink-0" />}
                  {bc.isLast ? (
                    <span style={{ color: theme?.headerTextColor || 'var(--color-header-text)' }}>{bc.label}</span>
                  ) : (
                    <Link to={bc.href} className="hover:text-theme-primary transition-colors">{bc.label}</Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              className="p-2 transition-colors relative rounded-xl hover:bg-slate-50"
              style={{ color: theme?.headerTextColor || 'var(--color-header-text)' }}
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full ring-2 ring-white" style={{ backgroundColor: theme?.errorColor || 'var(--color-error)' }} />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl transition-all hover:bg-slate-50"
              >
                {user?.hospitalAdmin?.profileImageUrl ? (
                  <img 
                    src={user.hospitalAdmin.profileImageUrl} 
                    alt="Admin Avatar" 
                    className="h-8 w-8 rounded-xl object-cover border shadow-sm"
                    style={{ borderColor: theme?.borderColor || 'var(--color-border)' }}
                  />
                ) : (
                  <div 
                    className="h-8 w-8 rounded-xl bg-theme-primary/10 flex items-center justify-center border font-bold uppercase text-xs"
                    style={{ 
                      color: theme?.primaryColor || 'var(--color-primary)', 
                      borderColor: theme?.borderColor || 'var(--color-border)'
                    }}
                  >
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left shrink-0">
                  <span className="text-xs font-bold leading-none" style={{ color: theme?.headerTextColor || 'var(--color-header-text)' }}>{user?.firstName} {user?.lastName}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Hospital Admin</span>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden md:block" />
              </button>

              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/60 p-1.5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="px-3.5 py-2.5 border-b border-slate-100 shrink-0">
                      <span className="text-xs font-semibold text-slate-400 block">Logged in as</span>
                      <span className="text-xs font-bold text-slate-700 block truncate mt-0.5">{user?.email}</span>
                    </div>
                    <Link to="/company/settings" onClick={() => setUserDropdownOpen(false)} className="flex items-center w-full px-3 py-2 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors mt-1">
                      <Settings className="w-4 h-4 mr-2.5 text-slate-400" /> Account Settings
                    </Link>
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
