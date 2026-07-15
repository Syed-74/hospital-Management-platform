import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext';
import { useTheme } from '../../core/context/ThemeProvider';
import { 
  LayoutDashboard, 
  Building2, 
  ShieldCheck, 
  Stethoscope, 
  Activity, 
  FlaskConical, 
  Pill, 
  CreditCard, 
  Users2, 
  Truck, 
  FileCheck, 
  MessageSquare, 
  BarChart3, 
  Sliders, 
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Hospital,
  Bell,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import Settings from '../PlatformAdmin/Settings';

export default function HospitalDashboard() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // Track which sidebar menu categories are expanded/collapsed
  const [expandedCategories, setExpandedCategories] = useState({
    'Manage Branch': true,
    'Identity & Access Management': false,
    'Clinical Administration': false,
    'Hospital Operations': false,
    'Diagnostic Services': false,
    'Pharmacy & Medication': false,
    'Financial Administration': false,
    'Human Resources': false,
    'Supply Chain': false,
    'Quality & Compliance': false,
    'Communication': false,
    'Reports & Analytics': false,
    'System Administration': false,
    'Help & Support': false,
  });

  const location = useLocation();
  const { logout, user } = useAuth();
  const { theme } = useTheme();
  const [hospitalLogo, setHospitalLogo] = useState("");

  React.useEffect(() => {
    if (user?.hospital?.logo) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';
      const logoPath = user.hospital.logo.startsWith('/') ? user.hospital.logo : `/${user.hospital.logo}`;
      setHospitalLogo(user.hospital.logo.startsWith('http') ? user.hospital.logo : `${baseUrl}${logoPath}`);
    }
  }, [user]);

  // Complete Enterprise Business Architecture Navigation Outline
  const NAVIGATION_CONFIG = [
    {
      category: 'Overview Dashboard',
      isSingle: true,
      name: 'Hospital Dashboard',
      href: '/company/overview',
      icon: LayoutDashboard
    },
    {
      category: 'Manage Branch & Access',
      icon: Building2,
      items: [
        { name: 'Branch Management', href: '/company/branch/manage' },
        { name: 'Manage Branch Admin', href: '/company/branch/org-structure' },
        { name: 'Roles & Permissions', href: '/company/roles-permissions' },
        { name: 'Users', href: '/company/iam/users' },
        
        // { name: 'Permission Management', href: '/company/iam/permissions' },
       
      ]
    },
    // {
    //   category: 'Identity & Access Management',
    //   icon: ShieldCheck,
    //   items: [
        
    //   ]
    // },
    {
      category: 'Clinical Administration',
      icon: Stethoscope,
      items: [
        { name: 'Doctors', href: '/company/clinical/doctors' },
        { name: 'Nursing', href: '/company/clinical/nursing' },
        { name: 'Patient Services', href: '/company/clinical/patients' },
        { name: 'Appointment Configuration', href: '/company/clinical/appointments' },
        { name: 'Admission Configuration', href: '/company/clinical/admission' },
        { name: 'Discharge Configuration', href: '/company/clinical/discharge' },
        { name: 'Bed Configuration', href: '/company/clinical/beds' },
        { name: 'Ward Configuration', href: '/company/clinical/wards' },
        { name: 'ICU Configuration', href: '/company/clinical/icu' },
        { name: 'OT Configuration', href: '/company/clinical/ot' }
      ]
    },
    {
      category: 'Hospital Operations',
      icon: Activity,
      items: [
        { name: 'OPD', href: '/company/ops/opd' },
        { name: 'IPD', href: '/company/ops/ipd' },
        { name: 'Emergency', href: '/company/ops/emergency' },
        { name: 'Operation Theatre', href: '/company/ops/ot' },
        { name: 'Nursing Station', href: '/company/ops/nursing-station' },
        { name: 'Ambulance', href: '/company/ops/ambulance' },
        { name: 'Bed Management', href: '/company/ops/beds' },
        { name: 'Patient Flow Monitor', href: '/company/ops/flow-monitor' }
      ]
    },
    {
      category: 'Diagnostic Services',
      icon: FlaskConical,
      items: [
        { name: 'Laboratory', href: '/company/diagnostics/lab' },
        { name: 'Radiology', href: '/company/diagnostics/radiology' },
        { name: 'Blood Bank', href: '/company/diagnostics/blood-bank' },
        { name: 'Pathology', href: '/company/diagnostics/pathology' }
      ]
    },
    {
      category: 'Pharmacy & Medication',
      icon: Pill,
      items: [
        { name: 'Pharmacy', href: '/company/pharmacy/store' },
        { name: 'Drug Catalog', href: '/company/pharmacy/drugs' },
        { name: 'Medication Policies', href: '/company/pharmacy/policies' },
        { name: 'Controlled Drugs', href: '/company/pharmacy/controlled' },
        { name: 'Prescription Rules', href: '/company/pharmacy/prescription-rules' }
      ]
    },
    {
      category: 'Financial Administration',
      icon: CreditCard,
      items: [
        { name: 'Billing', href: '/company/billing' },
        { name: 'Tariff Management', href: '/company/financial/tariffs' },
        { name: 'Packages', href: '/company/financial/packages' },
        { name: 'Insurance', href: '/company/financial/insurance' },
        { name: 'Claims', href: '/company/financial/claims' },
        { name: 'Refund Approvals', href: '/company/financial/refunds' },
        { name: 'Revenue Dashboard', href: '/company/financial/revenue' }
      ]
    },
    {
      category: 'Human Resources',
      icon: Users2,
      items: [
        { name: 'Employees', href: '/company/hr/employees' },
        { name: 'Recruitment', href: '/company/hr/recruitment' },
        { name: 'Attendance', href: '/company/hr/attendance' },
        { name: 'Leave', href: '/company/hr/leave' },
        { name: 'Shift Management', href: '/company/hr/shifts' },
        { name: 'Payroll', href: '/company/hr/payroll' },
        { name: 'Performance', href: '/company/hr/performance' },
        { name: 'Training', href: '/company/hr/training' }
      ]
    },
    {
      category: 'Supply Chain',
      icon: Truck,
      items: [
        { name: 'Inventory', href: '/company/scm/inventory' },
        { name: 'Purchase', href: '/company/scm/purchase' },
        { name: 'Vendors', href: '/company/scm/vendors' },
        { name: 'Warehouse', href: '/company/scm/warehouse' },
        { name: 'Assets', href: '/company/scm/assets' },
        { name: 'Maintenance', href: '/company/scm/maintenance' },
        { name: 'Stock Audit', href: '/company/scm/stock-audit' }
      ]
    },
    {
      category: 'Quality & Compliance',
      icon: FileCheck,
      items: [
        { name: 'Incident Management', href: '/company/quality/incidents' },
        { name: 'Infection Control', href: '/company/quality/infection' },
        { name: 'Clinical Audit', href: '/company/quality/audit' },
        { name: 'Risk Management', href: '/company/quality/risk' },
        { name: 'Compliance', href: '/company/quality/compliance' },
        { name: 'Accreditation', href: '/company/quality/accreditation' },
        { name: 'CAPA', href: '/company/quality/capa' }
      ]
    },
    {
      category: 'Communication',
      icon: MessageSquare,
      items: [
        { name: 'Announcements', href: '/company/comms/announcements' },
        { name: 'Notifications', href: '/company/comms/notifications' },
        { name: 'Internal Messaging', href: '/company/comms/messages' },
        { name: 'Email Templates', href: '/company/comms/email-templates' },
        { name: 'SMS Templates', href: '/company/comms/sms-templates' }
      ]
    },
    {
      category: 'Reports & Analytics',
      icon: BarChart3,
      items: [
        { name: 'Executive Dashboard', href: '/company/reports/executive' },
        { name: 'Clinical Reports', href: '/company/reports/clinical' },
        { name: 'Financial Reports', href: '/company/reports/financial' },
        { name: 'HR Reports', href: '/company/reports/hr' },
        { name: 'Inventory Reports', href: '/company/reports/inventory' },
        { name: 'Operational Reports', href: '/company/reports/operational' },
        { name: 'KPI Dashboard', href: '/company/reports/kpi' }
      ]
    },
    {
      category: 'System Administration',
      icon: Sliders,
      items: [
        { name: 'Master Data', href: '/company/sys/master-data' },
        { name: 'Lookup Management', href: '/company/sys/lookups' },
        { name: 'Number Series', href: '/company/sys/numbers' },
        { name: 'Workflow Engine', href: '/company/sys/workflows' },
        { name: 'Integration Settings', href: '/company/sys/integrations' },
        { name: 'API Management', href: '/company/sys/api' },
        { name: 'Background Jobs', href: '/company/sys/jobs' }
      ]
    },
    {
      category: 'Help & Support',
      icon: HelpCircle,
      items: [
        { name: 'Documentation', href: '/company/support/docs' },
        { name: 'Knowledge Base', href: '/company/support/kb' },
        { name: 'Support Tickets', href: '/company/support/tickets' },
        { name: 'System Status', href: '/company/support/status' }
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  // Toggle category expansion state
  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

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

  // Core Theme Color configurations mapped dynamically
  const primaryColor = theme?.primaryColor || '#0D9488'; // Default teal-600
  const headerTextColor = theme?.headerTextColor || '#111827'; // Default gray-900
  const sidebarColor = theme?.sidebarColor || '#FFFFFF';

  // YIQ luminance helper to check if a color is dark
  const isColorDark = (hex) => {
    if (!hex) return false;
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const bigint = parseInt(hex, 16);
    if (isNaN(bigint)) return false;
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq < 128;
  };

  const isSidebarDark = isColorDark(sidebarColor);

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
        <div 
          className="h-[72px] flex items-center px-6 border-b border-gray-100 shrink-0 relative overflow-hidden"
        >
          {/* Logo element */}
          {(theme?.showHospitalLogo ?? true) && (
            hospitalLogo ? (
              <img src={hospitalLogo} alt="Hospital Logo" className="h-8 w-8 object-contain rounded-lg shadow-sm" />
            ) : (
              <Hospital className="h-8 w-8 shrink-0 text-theme-primary" />
            )
          )}
          
          {/* Text Title (only if not mini) */}
          {!isMini && (theme?.showHospitalName ?? true) && (
            <div className="flex flex-col overflow-hidden text-left ml-3">
              <span className="text-sm font-extrabold tracking-tight leading-tight truncate text-gray-900">
                {user?.hospital?.hospitalName || 'Tenant Portal'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5 text-theme-primary">
                {user?.hospital?.hospitalCode || 'HOSP'}
              </span>
            </div>
          )}

          {/* Desktop Collapse Toggle (only if collapsibleSidebar is enabled) */}
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

            return (
              <div key={group.category} className="space-y-1">
                {/* Category Header */}
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

                {/* Sub Menu Items (only if expanded and not mini) */}
                {isExpanded && !isMini && (
                  <div className="pl-7 space-y-1 border-l border-gray-200 ml-6 mt-1">
                    {group.items.map((subItem) => {
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

                {/* Tooltip on mini sidebar hover */}
                {isMini && (
                  <div className="sr-only">
                    {group.category}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Logout */}
        <div 
          className="p-4 border-t border-gray-100 shrink-0"
        >
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
        <header 
          className={`h-[72px] border-b flex items-center justify-between px-6 z-30 shrink-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] bg-theme-header border-theme-border`}
        >
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden focus:outline-none p-1 rounded-lg hover:bg-gray-50 text-theme-header-text"
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
                    <span style={{ color: headerTextColor }}>{bc.label}</span>
                  ) : (
                    <Link to={bc.href} className="hover:text-gray-600 transition-colors">{bc.label}</Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              className="p-2 transition-colors relative rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-600"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl transition-all hover:bg-gray-50"
              >
                {user?.hospitalAdmin?.profileImageUrl ? (
                  <img 
                    src={user.hospitalAdmin.profileImageUrl} 
                    alt="Admin Avatar" 
                    className="h-8 w-8 rounded-xl object-cover border shadow-sm border-theme-border"
                  />
                ) : (
                  <div 
                    className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center border font-bold uppercase text-xs text-theme-primary border-theme-border"
                  >
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left shrink-0">
                  <span className="text-xs font-bold leading-none text-theme-header-text">{user?.firstName} {user?.lastName}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Hospital Admin</span>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden md:block" />
              </button>

              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-200/60 p-1.5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="px-3.5 py-2.5 border-b border-gray-100 shrink-0">
                      <span className="text-xs font-semibold text-slate-400 block">Logged in as</span>
                      <span className="text-xs font-bold text-slate-700 block truncate mt-0.5">{user?.email}</span>
                    </div>
                    <Link to="/company/settings" onClick={() => setUserDropdownOpen(false)} className="flex items-center w-full px-3 py-2 text-xs font-bold text-slate-700 rounded-xl hover:bg-gray-50 transition-colors mt-1">
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
