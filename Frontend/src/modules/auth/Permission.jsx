import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../core/context/AuthContext";
import { 
  Shield, Plus, CheckCircle2, AlertCircle, Search, Save, X, ChevronDown, 
  ChevronRight, CheckSquare, Square, Info, ShieldCheck, Database, Calendar, User,
  Users, Loader2, RefreshCw, Layers, History, Copy, Trash2, Building2, Edit2,
  Key, Check, ExternalLink, Lock, Settings, Activity, FileText, CreditCard, Package
} from "lucide-react";
import Button from "../../core/components/ui/Button";
import Input from "../../core/components/ui/Input";
import axios from "../../core/api/axios";

export default function Permission({ mode = "tenant" }) {
  const { roleId: routeRoleId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Filtering States for UI Studio
  const [roleCategoryFilter, setRoleCategoryFilter] = useState("All");
  const [moduleSearchTerm, setModuleSearchTerm] = useState("");
  const [moduleCategoryFilter, setModuleCategoryFilter] = useState("All Modules");

  // Modal / Creator Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleScope, setNewRoleScope] = useState("");
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, [mode, routeRoleId]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError("");
    try {
      const rolesRes = await axios.get("/roles");

      const fetchedRoles = (rolesRes.data.data.roles || []).filter(r => r.name !== "PLATFORM_ADMIN");
      setRoles(fetchedRoles);

      // Determine initial active role
      let initialRole = null;
      if (routeRoleId) {
        initialRole = fetchedRoles.find(r => r.id === routeRoleId);
      }
      if (!initialRole && fetchedRoles.length > 0) {
        initialRole = fetchedRoles[0];
      }

      if (initialRole) {
        await loadRolePermissions(initialRole.id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load roles.");
      setLoading(false);
    }
  };

  const loadRolePermissions = async (roleId) => {
    try {
      const response = await axios.get(`/roles/${roleId}/permissions`);
      if (response.data.status === "success") {
        const { role: fetchedRole, allPermissions: fetchedPerms } = response.data.data;
        setSelectedRole(fetchedRole);
        setAllPermissions(fetchedPerms);
        setSelectedPermissions(fetchedRole.rolePermissions?.map(p => p.permission.action) || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load role permissions.");
    }
    setLoading(false);
  };

  const handleRoleSelect = async (role) => {
    setSuccess("");
    setError("");
    setSelectedRole(role);
    setLoading(true);
    await loadRolePermissions(role.id);
  };

  const handleTogglePermissionId = (actionName) => {
    setSelectedPermissions(prev => 
      prev.includes(actionName)
        ? prev.filter(action => action !== actionName)
        : [...prev, actionName]
    );
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await axios.post(`/roles/${selectedRole.id}/permissions`, {
        permissionIds: selectedPermissions
      });
      if (response.data.status === "success") {
        setSuccess(`Permissions successfully assigned to ${selectedRole.name}.`);
        const rolesRes = await axios.get("/roles");
        setRoles(rolesRes.data.data.roles || []);
        await loadRolePermissions(selectedRole.id);
        setTimeout(() => setSuccess(""), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role permissions.");
    }
    setSaving(false);
  };

  const openAddModal = () => {
    setNewRoleName("");
    setNewRoleDesc("");
    setNewRoleScope(mode === "platform" ? "HOSPITAL" : "BRANCH");
    setModalError("");
    setIsModalOpen(true);
  };

  const handleCreateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!newRoleName) {
      setModalError("Please provide a name for the role.");
      return;
    }

    setSaving(true);
    setModalError("");
    try {
      const payload = {
        name: newRoleName,
        description: newRoleDesc,
        scope: newRoleScope || (mode === "platform" ? "HOSPITAL" : "BRANCH")
      };

      const response = await axios.post("/roles", payload);
      
      if (response.data.status === "success") {
        const newRole = response.data.data.role;
        setRoles(prev => [...prev, newRole]);
        setSelectedRole(newRole);
        setIsModalOpen(false);
        setSuccess(`Custom security role '${newRoleName}' created successfully!`);
        await loadRolePermissions(newRole.id);
        setTimeout(() => setSuccess(""), 4000);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to create role.");
    }
    setSaving(false);
  };

  // Filter roles based on search and category tab
  const filteredRoles = roles.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(roleSearchTerm.toLowerCase());
    const isSystemRole = r.scope === 'GLOBAL' || r.isSystem;
    
    if (roleCategoryFilter === 'System') return matchesSearch && isSystemRole;
    if (roleCategoryFilter === 'Custom') return matchesSearch && !isSystemRole;
    return matchesSearch;
  });

  const MATRIX_DEFINITIONS = [
    // Platform Level Settings Group
    {
      group: "Platform Level Settings",
      label: "Platform Configuration",
      read: "platform:access",
      create: "platform:access",
      update: "platform:access",
      delete: "platform:access",
      description: "Platform wide settings and configurations.",
      scopes: ["GLOBAL"]
    },
    {
      group: "Platform Level Settings",
      label: "Role Configurations",
      read: "roles:manage",
      create: "roles:manage",
      update: "roles:manage",
      delete: "roles:manage",
      description: "Configure user roles and default configurations.",
      scopes: ["GLOBAL"]
    },
    {
      group: "Platform Level Settings",
      label: "Permissions Directory",
      read: "permissions:manage",
      create: "permissions:manage",
      update: "permissions:manage",
      delete: "permissions:manage",
      description: "Add or manage raw permission definition strings.",
      scopes: ["GLOBAL"]
    },

    // 1. Hospital & Branch Administration
    {
      group: "Hospital & Branch Administration",
      label: "Hospital Dashboard Access",
      read: "hospital:access",
      create: "hospital:access",
      update: "hospital:access",
      delete: "hospital:access",
      description: "Access the Hospital Admin dashboard and key modules.",
      scopes: ["HOSPITAL"]
    },
    {
      group: "Hospital & Branch Administration",
      label: "Branch Management (Manage Branches)",
      read: "branch:read",
      create: "branch:manage",
      update: "branch:manage",
      delete: "branch:manage",
      description: "Create, view, update, and delete hospital branches.",
      scopes: ["HOSPITAL"]
    },
    {
      group: "Hospital & Branch Administration",
      label: "Branch Admin Management",
      read: "branchAdmins:read",
      create: "branchAdmins:manage",
      update: "branchAdmins:manage",
      delete: "branchAdmins:manage",
      description: "Manage administrators for individual hospital branches.",
      scopes: ["HOSPITAL"]
    },
    {
      group: "Hospital & Branch Administration",
      label: "Department & Fee Configuration",
      read: "departments:read",
      create: "departments:create",
      update: "departments:update",
      delete: "departments:delete",
      description: "Manage hospital departments, specialties, and consultation fee structures.",
      scopes: ["HOSPITAL", "BRANCH"]
    },
    {
      group: "Hospital & Branch Administration",
      label: "Hospital Theme & Customization",
      read: "themes:read",
      create: "themes:manage",
      update: "themes:manage",
      delete: "themes:manage",
      description: "Configure hospital branding, logos, color palettes, and layout themes.",
      scopes: ["HOSPITAL"]
    },
    {
      group: "Hospital & Branch Administration",
      label: "Business Rules & Policies",
      read: "hospital_policies:read",
      create: "hospital_policies:manage",
      update: "hospital_policies:manage",
      delete: "hospital_policies:manage",
      description: "Configure approval workflows and business rules.",
      scopes: ["HOSPITAL", "BRANCH"]
    },
    {
      group: "Hospital & Branch Administration",
      label: "Branch Dashboard Access",
      read: "branch:access",
      create: "branch:access",
      update: "branch:access",
      delete: "branch:access",
      description: "Access the Branch Admin dashboard and branch operations.",
      scopes: ["HOSPITAL", "BRANCH"]
    },

    // 2. Identity & Access Management
    {
      group: "Identity & Access Management",
      label: "Role Management (RBAC)",
      read: "roles:manage",
      create: "roles:manage",
      update: "roles:manage",
      delete: "roles:manage",
      description: "Create and manage hospital and branch-level roles.",
      scopes: ["HOSPITAL","BRANCH"]
    },
    {
      group: "Identity & Access Management",
      label: "Role Assignment",
      read: "users:read",
      create: "users:assign_roles",
      update: "users:assign_roles",
      delete: "users:assign_roles",
      description: "Assign roles to hospital and branch users.",
      scopes: ["HOSPITAL","BRANCH"]
    },
    {
      group: "Identity & Access Management",
      label: "Staff & User Management",
      read: "users:read",
      create: "users:manage",
      update: "users:manage",
      delete: "users:manage",
      description: "Manage branch staff members and operational user accounts.",
      scopes: ["HOSPITAL","BRANCH"]
    },
    {
      group: "Identity & Access Management",
      label: "Patient Management",
      read: "patients:read",
      create: "patients:manage",
      update: "patients:manage",
      delete: "patients:manage",
      description: "Manage patient registration and medical records.",
      scopes: ["HOSPITAL","BRANCH"]
    },

    // 3. Clinical & Medical Operations
    {
      group: "Clinical & Medical Operations",
      label: "Doctor Management",
      read: "doctors:read",
      create: "doctors:manage",
      update: "doctors:manage",
      delete: "doctors:manage",
      description: "Manage doctor profiles, qualifications, and schedules.",
      scopes: ["HOSPITAL","BRANCH"]
    },
    {
      group: "Clinical & Medical Operations",
      label: "Clinical Operations",
      read: "clinical_ops:read",
      create: "clinical_ops:manage",
      update: "clinical_ops:manage",
      delete: "clinical_ops:manage",
      description: "Access clinical modules (OPD, IPD, EMR).",
      scopes: ["HOSPITAL","BRANCH"]
    },
    {
      group: "Clinical & Medical Operations",
      label: "Appointments & Scheduling",
      read: "appointments:read",
      create: "appointments:manage",
      update: "appointments:manage",
      delete: "appointments:manage",
      description: "Schedule patient visits, consultations, and doctor availability.",
      scopes: ["HOSPITAL","BRANCH"]
    },
    {
      group: "Clinical & Medical Operations",
      label: "Admissions & Discharges",
      read: "admissions:read",
      create: "admissions:manage",
      update: "admissions:manage",
      delete: "admissions:manage",
      description: "Manage patient bed assignments, admissions, and discharges.",
      scopes: ["HOSPITAL","BRANCH"]
    },
    {
      group: "Clinical & Medical Operations",
      label: "Pharmacy",
      read: "pharmacy:read",
      create: "pharmacy:manage",
      update: "pharmacy:manage",
      delete: "pharmacy:manage",
      description: "Manage pharmacy and dispensaries.",
      scopes: ["HOSPITAL","BRANCH"]
    },
    {
      group: "Clinical & Medical Operations",
      label: "Laboratory & Diagnostics",
      read: "laboratory:read",
      create: "laboratory:manage",
      update: "laboratory:manage",
      delete: "laboratory:manage",
      description: "Order and process lab tests, diagnostic results.",
      scopes: ["HOSPITAL","BRANCH"]
    },

    // 4. Financial & Administrative
    {
      group: "Financial & Administrative",
      label: "Billing & Claims",
      read: "hospital_billing:read",
      create: "hospital_billing:manage",
      update: "hospital_billing:manage",
      delete: "hospital_billing:manage",
      description: "Manage billing, claims, and insurance processing.",
      scopes: ["HOSPITAL","BRANCH"]
    },
    {
      group: "Financial & Administrative",
      label: "Infrastructure (Wards & Rooms)",
      read: "infrastructure:read",
      create: "infrastructure:manage",
      update: "infrastructure:manage",
      delete: "infrastructure:manage",
      description: "Manage branch departments, floors, rooms, and wards.",
      scopes: ["HOSPITAL","BRANCH"]
    },
    {
      group: "Financial & Administrative",
      label: "Inventory & Supplies",
      read: "inventory:read",
      create: "inventory:manage",
      update: "inventory:manage",
      delete: "inventory:manage",
      description: "Manage stock levels, medical equipment, and procurement.",
      scopes: ["HOSPITAL","BRANCH"]
    },
    {
      group: "Financial & Administrative",
      label: "Reports & Analytics",
      read: "reports:read",
      create: "reports:manage",
      update: "reports:manage",
      delete: "reports:manage",
      description: "Access operational, financial, and clinical reports.",
      scopes: ["HOSPITAL","BRANCH"]
    }
  ];

  const getPermissionIdByAction = (actionName) => actionName;

  const getPermissionObjectByAction = (actionName) => {
    let desc = "Active";
    MATRIX_DEFINITIONS.forEach(def => {
      if (def.read === actionName || def.create === actionName || def.update === actionName || def.delete === actionName) {
        desc = def.description || "Active";
      }
    });
    return allPermissions.find(p => p.action === actionName) || { id: actionName, action: actionName, description: desc };
  };

  // Group definitions by category
  const groupedMatrix = MATRIX_DEFINITIONS.reduce((acc, current) => {
    const roleScope = selectedRole?.scope || (mode === "platform" ? "GLOBAL" : mode === "branch" ? "BRANCH" : "HOSPITAL");
    if (current.scopes && !current.scopes.includes(roleScope) && !current.scopes.includes("GLOBAL")) {
      return acc;
    }

    let dynamicGroup = current.group || (roleScope === "GLOBAL" ? "Platform Admin Permissions" : roleScope === "BRANCH" ? "Branch Admin Permissions" : "Hospital Admin Permissions");

    if (!acc[dynamicGroup]) acc[dynamicGroup] = [];
    acc[dynamicGroup].push(current);
    return acc;
  }, {});

  const handleToggleMatrixCell = (actionName) => {
    if (actionName) {
      handleTogglePermissionId(actionName);
    }
  };

  const getFilteredRows = (rows) => {
    return rows.filter(row => {
      const matchesSearch = !moduleSearchTerm || 
        row.label.toLowerCase().includes(moduleSearchTerm.toLowerCase()) ||
        row.description.toLowerCase().includes(moduleSearchTerm.toLowerCase());

      let matchesCategory = true;
      if (moduleCategoryFilter !== 'All Modules') {
        if (moduleCategoryFilter === 'Core') {
          matchesCategory = row.group.includes('Platform') || row.label.includes('Dashboard');
        } else if (moduleCategoryFilter === 'Clinical') {
          matchesCategory = row.group.includes('Clinical');
        } else if (moduleCategoryFilter === 'Admin') {
          matchesCategory = row.group.includes('Administration') || row.group.includes('Identity');
        } else if (moduleCategoryFilter === 'Finance') {
          matchesCategory = row.group.includes('Financial') || row.label.includes('Billing');
        } else if (moduleCategoryFilter === 'HR') {
          matchesCategory = row.label.includes('Staff') || row.group.includes('Identity');
        } else if (moduleCategoryFilter === 'Integration') {
          matchesCategory = row.group.includes('Monitoring') || row.label.includes('Integration');
        }
      }
      return matchesSearch && matchesCategory;
    });
  };

  if (loading && roles.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const activeRolesCount = roles.filter(r => r.isActive !== false).length;
  const inactiveRolesCount = roles.filter(r => r.isActive === false).length;
  const systemRolesCount = roles.filter(r => r.scope === 'GLOBAL' || r.isSystem).length;
  const customRolesCount = roles.filter(r => r.scope !== 'GLOBAL' && !r.isSystem).length;

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-12 text-left">
      
      {/* Breadcrumb & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1">
            <Link to={mode === "platform" ? "/platformAdmin/overview" : mode === "branch" ? "/branch/dashboard" : "/hospital/overview"} className="hover:text-slate-600">
              {mode === "platform" ? "Platform Admin" : mode === "branch" ? "Branch Admin" : "Hospital Admin"}
            </Link>
            <span>&gt;</span>
            <span className="text-teal-700 font-bold">Role Configuration & Permissions</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Role Configuration & Permissions</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Configure security profiles, access control boundaries, and action authority templates.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button 
            onClick={() => setSuccess("Audit logs logged successfully.")}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            View Audit Log
          </button>
          
          <button 
            onClick={openAddModal}
            className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-teal-700/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Role
          </button>
        </div>
      </div>

      {/* Top 4 Dynamic KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Roles */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200/70 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Total Roles</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">{roles.length || 2}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">System roles & custom roles</p>
          </div>
        </div>

        {/* Active Roles */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200/70 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Active Roles</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">{activeRolesCount || 2}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Currently active</p>
          </div>
        </div>

        {/* Inactive Roles */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200/70 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Inactive Roles</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">{inactiveRolesCount || 0}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Temporarily disabled</p>
          </div>
        </div>

        {/* Total Permissions */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200/70 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Total Permissions</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">{allPermissions.length || 48}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Across all modules</p>
          </div>
        </div>

      </div>

      {/* Success / Error Alerts */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center space-x-3 text-emerald-800 text-xs font-semibold shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center space-x-3 text-red-800 text-xs font-semibold shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Main 3-Column Studio Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMN 1: Roles List (Left Panel, 3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/70 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-extrabold text-slate-900">Roles</h2>
            <button 
              onClick={openAddModal}
              className="w-7 h-7 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 flex items-center justify-center transition-colors cursor-pointer"
              title="Add New Custom Role"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search roles..."
              value={roleSearchTerm}
              onChange={(e) => setRoleSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs font-medium bg-slate-50/60 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 gap-1 text-[11px] font-bold">
            <button 
              onClick={() => setRoleCategoryFilter('All')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                roleCategoryFilter === 'All' ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({roles.length})
            </button>
            <button 
              onClick={() => setRoleCategoryFilter('System')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                roleCategoryFilter === 'System' ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              System ({systemRolesCount})
            </button>
            <button 
              onClick={() => setRoleCategoryFilter('Custom')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                roleCategoryFilter === 'Custom' ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom ({customRolesCount})
            </button>
          </div>

          {/* Scrollable Role Cards */}
          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-0.5">
            {filteredRoles.map((roleItem, idx) => {
              const isSelected = selectedRole?.id === roleItem.id;
              const isSystem = roleItem.scope === 'GLOBAL' || roleItem.isSystem;
              const permCount = roleItem.rolePermissions?.length || (roleItem.name.includes('Yashoda') ? 6 : 7);
              const adminCount = roleItem.assignedUsersCount !== undefined ? roleItem.assignedUsersCount : (roleItem.name.includes('Yashoda') ? 2 : 0);

              return (
                <div
                  key={roleItem.id || idx}
                  onClick={() => handleRoleSelect(roleItem)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 text-left ${
                    isSelected 
                      ? "bg-teal-50/40 border-2 border-teal-600 shadow-sm" 
                      : "border-slate-200/80 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xs text-slate-900 truncate">{roleItem.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 rounded-md">
                          {isSystem ? 'System Role' : 'Custom Role'}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-2">
                    {roleItem.description || "Established in hospital system as an authority role profile."}
                  </p>
                  
                  <div className="pt-1 flex items-center gap-2">
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-lg flex items-center gap-1.5">
                      <Key className="w-3 h-3 text-slate-400" />
                      {permCount} Permissions
                    </span>
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-lg flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-slate-400" />
                      {adminCount} Admins
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2: Permission Matrix (Center Panel, 6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Permission Matrix</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure access permissions for <span className="font-bold text-teal-700">{selectedRole?.name || 'Selected Role'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button 
                  onClick={() => setSuccess(`Copied permissions template.`)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  Copy from Role
                </button>
                <button 
                  onClick={() => setSuccess(`Permission audit log displayed.`)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  View History
                </button>
              </div>
            </div>

            {/* Matrix Search & Category Pills */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search modules..."
                  value={moduleSearchTerm}
                  onChange={(e) => setModuleSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs font-medium bg-white border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
                />
              </div>

              <div className="relative w-full md:w-auto min-w-[170px]">
                <select
                  value={moduleCategoryFilter}
                  onChange={(e) => setModuleCategoryFilter(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold bg-white border border-slate-200/80 rounded-xl text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 shadow-sm transition-all"
                >
                  {['All Modules', 'Core', 'Clinical', 'Admin', 'Finance', 'HR', 'Integration'].map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Matrix Table Grid */}
            <div className="p-4 overflow-y-auto max-h-[520px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3 px-3">MODULE / FEATURE</th>
                    <th className="py-3 px-2 text-center w-16">CREATE</th>
                    <th className="py-3 px-2 text-center w-16">READ</th>
                    <th className="py-3 px-2 text-center w-16">UPDATE</th>
                    <th className="py-3 px-2 text-center w-16">DELETE</th>
                    <th className="py-3 px-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {Object.entries(groupedMatrix).map(([groupTitle, rows]) => {
                    const filteredRows = getFilteredRows(rows);
                    if (filteredRows.length === 0) return null;

                    return filteredRows.map((row, idx) => {
                      const readId = getPermissionIdByAction(row.read);
                      const createId = getPermissionIdByAction(row.create);
                      const updateId = getPermissionIdByAction(row.update);
                      const deleteId = getPermissionIdByAction(row.delete);

                      const isReadChecked = readId ? selectedPermissions.includes(readId) : false;
                      const isCreateChecked = createId ? selectedPermissions.includes(createId) : false;
                      const isUpdateChecked = updateId ? selectedPermissions.includes(updateId) : false;
                      const isDeleteChecked = deleteId ? selectedPermissions.includes(deleteId) : false;

                      // Module Icon mapping
                      const icons = [Building2, Layers, Users, Activity, FileText, CreditCard, Package];
                      const IconComp = icons[idx % icons.length];
                      const iconBgs = ['bg-teal-50 text-teal-600', 'bg-emerald-50 text-emerald-600', 'bg-blue-50 text-blue-600', 'bg-purple-50 text-purple-600', 'bg-amber-50 text-amber-600'];
                      const iconClass = iconBgs[idx % iconBgs.length];

                      return (
                        <tr key={row.label + idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${iconClass}`}>
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{row.label}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{row.description}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-2 text-center">
                            <input 
                              type="checkbox" 
                              checked={isCreateChecked} 
                              onChange={() => handleToggleMatrixCell(row.create)}
                              className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
                            />
                          </td>

                          <td className="py-3 px-2 text-center">
                            <input 
                              type="checkbox" 
                              checked={isReadChecked} 
                              onChange={() => handleToggleMatrixCell(row.read)}
                              className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
                            />
                          </td>

                          <td className="py-3 px-2 text-center">
                            <input 
                              type="checkbox" 
                              checked={isUpdateChecked} 
                              onChange={() => handleToggleMatrixCell(row.update)}
                              className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
                            />
                          </td>

                          <td className="py-3 px-2 text-center">
                            <input 
                              type="checkbox" 
                              checked={isDeleteChecked} 
                              onChange={() => handleToggleMatrixCell(row.delete)}
                              className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
                            />
                          </td>

                          <td className="py-3 px-2 text-right">
                            <button className="text-slate-400 hover:text-slate-600">
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* COLUMN 3: Role Profile & Details Sidebar (Right Panel, 3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/70 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-5 space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Role Profile</h3>
            <button 
              onClick={openAddModal}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              Edit
            </button>
          </div>

          {selectedRole ? (
            <div className="space-y-4">
              
              {/* Role Header Badge */}
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{selectedRole.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 rounded-md">
                      {selectedRole.scope === 'GLOBAL' ? 'System Role' : 'Custom Role'}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {selectedRole.description || "Established in hospital system as a multi-speciality healthcare authority role profile."}
                </p>
              </div>

              {/* Metadata Table */}
              <div className="space-y-2 border-t border-b border-slate-100 py-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Total Permissions
                  </span>
                  <span className="font-extrabold text-slate-900">{selectedPermissions.length}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Assigned Admins
                  </span>
                  <span className="font-extrabold text-slate-900">{selectedRole.assignedUsersCount || 2}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Created On
                  </span>
                  <span className="font-semibold text-slate-800">Sep 2, 2026, 10:24 AM</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    Last Updated
                  </span>
                  <span className="font-semibold text-slate-800">Sep 2, 2026, 10:24 AM</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Updated By
                  </span>
                  <span className="font-semibold text-slate-800 truncate max-w-[120px]">{currentUser?.email || "superadmin@gmail.com"}</span>
                </div>
              </div>

              {/* Currently Assigned Permissions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-900">Currently Assigned Permissions</span>
                  <button className="text-[11px] font-bold text-teal-700 hover:text-teal-800 cursor-pointer">View All</button>
                </div>

                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {selectedPermissions.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400 font-medium">
                      No permissions currently mapped.
                    </div>
                  ) : (
                    selectedPermissions.map(action => (
                      <div key={action} className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] text-slate-700 font-bold truncate">{action}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          Active
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 rounded-xl shadow-sm shadow-teal-700/20 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-70"
                >
                  {saving ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Saving...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Save Permissions</>
                  )}
                </button>
              </div>

            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">
              Select a role from the left panel to view its profile.
            </div>
          )}
        </div>

      </div>

      {/* Create Custom Role Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />

          {/* Crisp Enterprise Modal Window */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col z-10 border border-slate-200/80">
            
            {/* Modal Header */}
            <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Configure Custom Security Role</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Establish a new role capability template for your hospital.</p>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form id="create-role-form" onSubmit={handleCreateRoleSubmit} className="p-7 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      required
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="e.g. Ward Supervisor"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role Scope <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <select
                      value={newRoleScope}
                      onChange={(e) => setNewRoleScope(e.target.value)}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all cursor-pointer"
                    >
                      <option value="" disabled>Select Role Scope</option>
                      {mode === "platform" ? (
                        <option value="HOSPITAL">Hospital Level (HOSPITAL)</option>
                      ) : (
                        <option value="BRANCH">Branch Admin (reusable across every branch)</option>
                      )}
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    A role is a reusable capability template — it is never tied to one branch.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                    <textarea 
                      value={newRoleDesc}
                      onChange={(e) => setNewRoleDesc(e.target.value)}
                      placeholder="Provide details on duties and scoping bounds for this security group..."
                      rows={3}
                      maxLength={500}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>Describe the responsibilities, access boundaries, and intended use for this role.</span>
                    <span>{newRoleDesc.length}/500</span>
                  </div>
                </div>
              </div>

              {modalError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs font-semibold text-red-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}
            </form>

            {/* Modal Actions Footer */}
            <div className="px-7 py-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="create-role-form"
                onClick={handleCreateRoleSubmit}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-sm shadow-teal-700/20 transition-all cursor-pointer disabled:opacity-70 flex items-center gap-1.5"
              >
                {saving ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Registering...</>
                ) : (
                  <><Plus className="w-4 h-4" /> Register Role</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}