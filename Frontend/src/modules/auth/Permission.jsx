import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../core/context/AuthContext";
import { 
  Shield, Plus, CheckCircle2, AlertCircle, Search, Save, X, ChevronDown, 
  ChevronRight, CheckSquare, Square, Info, ShieldCheck, Database, Calendar, User,
  Users, Loader2, RefreshCw, Layers, History, Copy, Trash2
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
  const [selectedDashboard, setSelectedDashboard] = useState("");
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Modal / Creator Form states (Tenant mode specific)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleScope, setNewRoleScope] = useState("TENANT");
  const [modalError, setModalError] = useState("");

  const [dashboardOptions, setDashboardOptions] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, [mode, routeRoleId]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch all roles and dashboards from the database
      const [rolesRes, dashRes] = await Promise.all([
        axios.get("/roles"),
        axios.get("/dashboards")
      ]);
      const fetchedRoles = rolesRes.data.data.roles || [];
      setRoles(fetchedRoles);
      setDashboardOptions(dashRes.data.data.dashboards || []);

      // Determine initial active role
      let initialRole = null;
      if (mode === "platform" && routeRoleId) {
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
        setSelectedDashboard(fetchedRole.roleDashboards?.[0]?.dashboardId || "");
        setAllPermissions(fetchedPerms);
        // Use permission.action instead of permission.id
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
        permissionIds: selectedPermissions,
        dashboardId: selectedDashboard
      });
      if (response.data.status === "success") {
        setSuccess(`Permissions successfully assigned to ${selectedRole.name}.`);
        // Refresh local roles list to update UI mapping stats
        const rolesRes = await axios.get("/roles");
        setRoles(rolesRes.data.data.roles || []);
        
        // Reload currently selected role permissions
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
    setNewRoleScope("TENANT");
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
      const response = await axios.post("/roles", {
        name: newRoleName,
        description: newRoleDesc,
        scope: newRoleScope
      });
      
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

  // Filter roles based on search
  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(roleSearchTerm.toLowerCase())
  );

  // Group permission mappings logically for the Matrix UI
  // Maps a row key to its visual label, database prefixes/action suffixes, and categorization group.
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

    // 1. Hospital Administration & Operations
    {
      group: "Hospital Administration & Operations",
      label: "Hospital Dashboard Access",
      read: "hospital:access",
      create: "hospital:access",
      update: "hospital:access",
      delete: "hospital:access",
      description: "Access the Hospital Admin dashboard and modules.",
      scopes: ["TENANT", "GLOBAL"]
    },
    {
      group: "Hospital Administration & Operations",
      label: "Hospital Profile",
      read: "hospitals:read",
      create: "hospitals:update",
      update: "hospitals:update",
      delete: "hospitals:update",
      description: "Manage hospital details and configurations.",
      scopes: ["TENANT"]
    },
    {
      group: "Hospital Administration & Operations",
      label: "Branch Management",
      read: "branch:read",
      create: "branch:manage",
      update: "branch:manage",
      delete: "branch:manage",
      description: "Create and manage hospital branches.",
      scopes: ["TENANT"]
    },
    {
      group: "Hospital Administration & Operations",
      label: "Branch Admin Management",
      read: "branchAdmins:read",
      create: "branchAdmins:manage",
      update: "branchAdmins:manage",
      delete: "branchAdmins:manage",
      description: "Manage administrators for individual hospital branches.",
      scopes: ["TENANT"]
    },
    {
      group: "Hospital Administration & Operations",
      label: "Organizational Structure",
      read: "departments:read",
      create: "departments:create",
      update: "departments:update",
      delete: "departments:delete",
      description: "Manage departments, specialties, and service catalog.",
      scopes: ["TENANT"]
    },
    {
      group: "Hospital Administration & Operations",
      label: "Business Rules & Policies",
      read: "hospital_policies:read",
      create: "hospital_policies:manage",
      update: "hospital_policies:manage",
      delete: "hospital_policies:manage",
      description: "Configure approval workflows and business rules.",
      scopes: ["TENANT"]
    },

    // 2. Identity & Access Management (Tenant Level)
    {
      group: "Identity & Access Management",
      label: "Staff Management",
      read: "users:read",
      create: "hospitalUsers:manage",
      update: "hospitalUsers:manage",
      delete: "hospitalUsers:manage",
      description: "Manage users, doctors, nurses, and operational staff.",
      scopes: ["TENANT"]
    },
    {
      group: "Identity & Access Management",
      label: "Role Management (RBAC)",
      read: "roles:manage",
      create: "roles:manage",
      update: "roles:manage",
      delete: "roles:manage",
      description: "Create and manage hospital and branch-level roles.",
      scopes: ["TENANT"]
    },
    {
      group: "Identity & Access Management",
      label: "Role Assignment",
      read: "users:read",
      create: "users:assign_roles",
      update: "users:assign_roles",
      delete: "users:assign_roles",
      description: "Assign roles to hospital and branch users.",
      scopes: ["TENANT"]
    },

    // 3. Clinical & Medical Management
    {
      group: "Clinical & Medical Management",
      label: "Clinical Operations",
      read: "clinical_ops:read",
      create: "clinical_ops:manage",
      update: "clinical_ops:manage",
      delete: "clinical_ops:manage",
      description: "Oversee clinical activities and standards.",
      scopes: ["TENANT"]
    },
    {
      group: "Clinical & Medical Management",
      label: "Appointments",
      read: "hospital_appointments:read",
      create: "hospital_appointments:manage",
      update: "hospital_appointments:manage",
      delete: "hospital_appointments:manage",
      description: "Approve or manage appointments globally across branches.",
      scopes: ["TENANT"]
    },
    {
      group: "Clinical & Medical Management",
      label: "Laboratory",
      read: "laboratory:read",
      create: "laboratory:manage",
      update: "laboratory:manage",
      delete: "laboratory:manage",
      description: "Manage laboratory operations and diagnostics.",
      scopes: ["TENANT"]
    },
    {
      group: "Clinical & Medical Management",
      label: "Pharmacy",
      read: "pharmacy:read",
      create: "pharmacy:manage",
      update: "pharmacy:manage",
      delete: "pharmacy:manage",
      description: "Manage pharmacy and dispensaries.",
      scopes: ["TENANT"]
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
      scopes: ["TENANT"]
    },
    {
      group: "Financial & Administrative",
      label: "Financial Approvals",
      read: "financial_approvals:read",
      create: "financial_approvals:manage",
      update: "financial_approvals:manage",
      delete: "financial_approvals:manage",
      description: "Approve discounts, refunds, and financial workflows.",
      scopes: ["TENANT"]
    },
    {
      group: "Financial & Administrative",
      label: "Procurement & Inventory",
      read: "procurement:read",
      create: "procurement:manage",
      update: "procurement:manage",
      delete: "procurement:manage",
      description: "Purchasing and inventory oversight.",
      scopes: ["TENANT"]
    },
    {
      group: "Financial & Administrative",
      label: "Human Resources",
      read: "hr:read",
      create: "hr:manage",
      update: "hr:manage",
      delete: "hr:manage",
      description: "Staffing, leave management, and payroll approvals.",
      scopes: ["TENANT"]
    },

    // 5. Monitoring, Compliance & Integrations
    {
      group: "Monitoring & Integrations",
      label: "Dashboards & Reports",
      read: "hospital_reports:read",
      create: "hospital_reports:manage",
      update: "hospital_reports:manage",
      delete: "hospital_reports:manage",
      description: "Access analytics and export data.",
      scopes: ["TENANT"]
    },
    {
      group: "Monitoring & Integrations",
      label: "Compliance & Quality",
      read: "compliance:read",
      create: "compliance:manage",
      update: "compliance:manage",
      delete: "compliance:manage",
      description: "Review audit logs and handle quality requirements.",
      scopes: ["TENANT"]
    },
    {
      group: "Monitoring & Integrations",
      label: "Integrations",
      read: "integrations:read",
      create: "integrations:manage",
      update: "integrations:manage",
      delete: "integrations:manage",
      description: "Configure approved integrations (SMS, Payments, etc.).",
      scopes: ["TENANT"]
    },
    {
      group: "Monitoring & Integrations",
      label: "Notifications",
      read: "notifications:read",
      create: "notifications:manage",
      update: "notifications:manage",
      delete: "notifications:manage",
      description: "Manage notification templates and triggers.",
      scopes: ["TENANT"]
    },

    // 6. Branch Administration & Operations (Branch Scope)
    {
      group: "Branch Administration & Operations",
      label: "Branch Dashboard Access",
      read: "branch:access",
      create: "branch:access",
      update: "branch:access",
      delete: "branch:access",
      description: "Access the Branch Admin dashboard and modules.",
      scopes: ["BRANCH", "TENANT"]
    },
    {
      group: "Branch Administration & Operations",
      label: "Branch Profile & Config",
      read: "branch_profile:read",
      create: "branch_profile:manage",
      update: "branch_profile:manage",
      delete: "branch_profile:manage",
      description: "Manage local branch information and configuration.",
      scopes: ["BRANCH"]
    },
    {
      group: "Branch Administration & Operations",
      label: "Branch Departments & Services",
      read: "departments:read",
      create: "departments:create",
      update: "departments:update",
      delete: "departments:delete",
      description: "Manage local branch departments and services.",
      scopes: ["BRANCH"]
    },
    {
      group: "Branch Administration & Operations",
      label: "Branch Staff Management",
      read: "branch_staff:read",
      create: "branch_staff:manage",
      update: "branch_staff:manage",
      delete: "branch_staff:manage",
      description: "Manage branch staff, schedules, shifts, attendance, and leave.",
      scopes: ["BRANCH"]
    },
    {
      group: "Branch Administration & Operations",
      label: "Branch Roles & Permissions",
      read: "branch_roles:read",
      create: "branch_roles:manage",
      update: "branch_roles:manage",
      delete: "branch_roles:manage",
      description: "Assign approved roles to branch staff within delegated authority.",
      scopes: ["BRANCH"]
    },
    {
      group: "Branch Administration & Operations",
      label: "Patient Flow & Appointments",
      read: "branch_patients:read",
      create: "branch_patients:manage",
      update: "branch_patients:manage",
      delete: "branch_patients:manage",
      description: "Manage local appointments, patient flow, OPD, and IPD.",
      scopes: ["BRANCH"]
    },
    {
      group: "Branch Administration & Operations",
      label: "Emergency & Bed Management",
      read: "branch_emergency:read",
      create: "branch_emergency:manage",
      update: "branch_emergency:manage",
      delete: "branch_emergency:manage",
      description: "Manage emergency services and bed availability.",
      scopes: ["BRANCH"]
    },
    {
      group: "Branch Administration & Operations",
      label: "Branch Pharmacy & Lab",
      read: "branch_clinical:read",
      create: "branch_clinical:manage",
      update: "branch_clinical:manage",
      delete: "branch_clinical:manage",
      description: "Manage local pharmacy and laboratory operations.",
      scopes: ["BRANCH"]
    },
    {
      group: "Branch Administration & Operations",
      label: "Branch Financials & Inventory",
      read: "branch_finance:read",
      create: "branch_finance:manage",
      update: "branch_finance:manage",
      delete: "branch_finance:manage",
      description: "Manage local billing, inventory, and procurement.",
      scopes: ["BRANCH"]
    },
    {
      group: "Branch Administration & Operations",
      label: "Branch Reports & Compliance",
      read: "branch_reports:read",
      create: "branch_reports:manage",
      update: "branch_reports:manage",
      delete: "branch_reports:manage",
      description: "Manage branch reports, notifications, compliance, quality, and KPIs.",
      scopes: ["BRANCH"]
    }
  ];

  // Helper to resolve permission ID from action name
  const getPermissionIdByAction = (actionName) => {
    // We now use actionName directly as the identifier in the frontend
    return actionName;
  };

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
    // Filter matrix based on role scope
    const roleScope = selectedRole?.scope || 'TENANT';
    if (current.scopes && !current.scopes.includes(roleScope)) {
      return acc;
    }

    if (!acc[current.group]) acc[current.group] = [];
    acc[current.group].push(current);
    return acc;
  }, {});

  const handleToggleMatrixCell = (actionName) => {
    if (actionName) {
      handleTogglePermissionId(actionName);
    }
  };

  if (loading && roles.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Retrieving system database roles...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
        <Link to={mode === "platform" ? "/platformAdmin/overview" : mode === "branch" ? "/branch/dashboard" : "/hospital/overview"} className="hover:text-slate-600">
          {mode === "platform" ? "Platform Admin" : mode === "branch" ? "Branch Admin" : "Hospital Admin"}
        </Link>
        <span>/</span>
        <span className="text-slate-600">Role Configuration & Permissions</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-teal-600" />
            Role Configuration & Permissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure security profiles, access control boundaries, and action authority templates.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center space-x-3 text-green-800 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center space-x-3 text-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Roles list */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">Roles</h2>
            <button 
              onClick={openAddModal}
              className="p-1.5 hover:bg-slate-100 text-teal-600 rounded-lg transition-colors border border-slate-200"
              title="Add New Custom Role"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search roles..."
              value={roleSearchTerm}
              onChange={(e) => setRoleSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredRoles.map((roleItem) => {
              const isSelected = selectedRole?.id === roleItem.id;
              return (
                <div
                  key={roleItem.id}
                  onClick={() => handleRoleSelect(roleItem)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                    isSelected 
                      ? "bg-teal-50/50 border-teal-500 shadow-sm" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-slate-900 block truncate">{roleItem.name}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      {roleItem.scope}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                    {roleItem.description || "No description provided."}
                  </p>
                  
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Permissions
                    </span>
                    <span className="font-mono text-xs font-bold text-teal-600">
                      {roleItem.rolePermissions?.length || 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle Column: Matrix View */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>Permission Matrix</span>
                  {selectedRole && (
                    <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-semibold">
                      Configuring access for {selectedRole.name}
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <History className="w-3.5 h-3.5" />
                  View History
                </button>
                <button className="flex items-center gap-1 text-[10px] font-bold text-white bg-teal-600 px-2.5 py-1.5 rounded-lg hover:bg-teal-700 transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                  Clone Permissions
                </button>
              </div>
            </div>

            {/* Dashboard Assignment */}
            <div className="p-6 border-b border-slate-100 bg-white space-y-4">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 pb-2">
                <Layers className="w-4 h-4 text-teal-600" />
                Assign Landing Dashboard
              </h4>
              <p className="text-xs text-slate-500">Select the default dashboard that users with this role will see upon login.</p>
              <select 
                value={selectedDashboard} 
                onChange={(e) => setSelectedDashboard(e.target.value)}
                className="w-full sm:w-1/2 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">-- Select a Dashboard --</option>
                {dashboardOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name} ({opt.path})</option>
                ))}
              </select>
            </div>

            {/* Matrix Form / Checkboxes */}
            <div className="p-6 space-y-8 max-h-[600px] overflow-y-auto">
              {Object.entries(groupedMatrix).map(([category, rows]) => (
                <div key={category} className="space-y-3.5">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Layers className="w-4 h-4 text-teal-600" />
                    {category}
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                          <th className="py-2 w-2/5">Module Permission</th>
                          <th className="py-2 text-center w-1/8">Create</th>
                          <th className="py-2 text-center w-1/8">Read</th>
                          <th className="py-2 text-center w-1/8">Update</th>
                          <th className="py-2 text-center w-1/8">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {rows.map((row, idx) => {
                          // Map corresponding actions
                          const readId = getPermissionIdByAction(row.read);
                          const createId = getPermissionIdByAction(row.create);
                          const updateId = getPermissionIdByAction(row.update);
                          const deleteId = getPermissionIdByAction(row.delete);

                          const isReadChecked = readId ? selectedPermissions.includes(readId) : false;
                          const isCreateChecked = createId ? selectedPermissions.includes(createId) : false;
                          const isUpdateChecked = updateId ? selectedPermissions.includes(updateId) : false;
                          const isDeleteChecked = deleteId ? selectedPermissions.includes(deleteId) : false;

                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 pr-4">
                                <span className="font-bold text-slate-800 block">{row.label}</span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">{row.description}</span>
                              </td>
                              <td className="py-3 text-center">
                                {createId ? (
                                  <input 
                                    type="checkbox" 
                                    checked={isCreateChecked} 
                                    onChange={() => handleToggleMatrixCell(row.create)}
                                    className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500/20"
                                  />
                                ) : (
                                  <span className="text-slate-200 font-bold">-</span>
                                )}
                              </td>
                              <td className="py-3 text-center">
                                {readId ? (
                                  <input 
                                    type="checkbox" 
                                    checked={isReadChecked} 
                                    onChange={() => handleToggleMatrixCell(row.read)}
                                    className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500/20"
                                  />
                                ) : (
                                  <span className="text-slate-200 font-bold">-</span>
                                )}
                              </td>
                              <td className="py-3 text-center">
                                {updateId ? (
                                  <input 
                                    type="checkbox" 
                                    checked={isUpdateChecked} 
                                    onChange={() => handleToggleMatrixCell(row.update)}
                                    className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500/20"
                                  />
                                ) : (
                                  <span className="text-slate-200 font-bold">-</span>
                                )}
                              </td>
                              <td className="py-3 text-center">
                                {deleteId ? (
                                  <input 
                                    type="checkbox" 
                                    checked={isDeleteChecked} 
                                    onChange={() => handleToggleMatrixCell(row.delete)}
                                    className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500/20"
                                  />
                                ) : (
                                  <span className="text-slate-200 font-bold">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Role & Assigned Permissions summary */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Role Profile Summary</h3>
          </div>

          {selectedRole ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Selected Role</span>
                <span className="text-sm font-bold text-slate-900 block">{selectedRole.name}</span>
                <span className="text-[10px] text-slate-500 leading-relaxed block">{selectedRole.description || "No description provided."}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Selected Dashboard</span>
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {selectedDashboard ? dashboardOptions.find(d => d.id === selectedDashboard)?.name || selectedDashboard : "Not Assigned"}
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Currently Assigned Permissions</span>
                <div className="border border-slate-100 rounded-xl max-h-[250px] overflow-y-auto p-2 bg-slate-50/50 space-y-1">
                  {selectedPermissions.length === 0 ? (
                    <div className="p-4 text-center text-[10px] text-slate-400">
                      No permissions currently mapped.
                    </div>
                  ) : (
                    selectedPermissions.map(action => {
                      const permObj = getPermissionObjectByAction(action);
                      return (
                        <div key={action} className="p-1.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                          <span className="font-mono text-[9px] text-teal-700 font-bold truncate">{action}</span>
                          <span className="text-[8px] text-slate-400 shrink-0 font-medium">{permObj?.description || "Active"}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3.5 space-y-2 text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Total Assigned:</span>
                  <span className="font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{selectedPermissions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Last Updated:
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedRole.updatedAt ? new Date(selectedRole.updatedAt).toLocaleDateString() : "Just now"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Updated By:
                  </span>
                  <span className="font-bold text-slate-800 truncate max-w-[100px]">
                    {currentUser?.email || "System Admin"}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button 
                  onClick={handleSave}
                  isLoading={saving}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-2.5 font-bold shadow-md shadow-teal-500/10 transition-all border-none flex items-center justify-center gap-1.5 text-xs"
                >
                  <Save className="w-4 h-4" />
                  Save Permissions
                </Button>
                <Button 
                  type="button"
                  onClick={() => loadRolePermissions(selectedRole.id)}
                  className="w-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl py-2 text-xs font-semibold transition-all"
                >
                  Discard Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">
              Select a role from the left to configure.
            </div>
          )}
        </div>

      </div>

      {/* Create Custom Role Slide-over Modal (Tenant mode only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-lg h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Configure Custom Security Role</h3>
                <p className="text-xs text-slate-400 mt-0.5">Establish a new role capability template for your hospital.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleCreateRoleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Role Name *</label>
                  <Input 
                    type="text" 
                    required
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. Ward Supervisor"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Role Scope *</label>
                  <select
                    value={newRoleScope}
                    onChange={(e) => setNewRoleScope(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/10"
                  >
                    <option value="TENANT">Hospital Level (TENANT)</option>
                    <option value="BRANCH">Branch Level (BRANCH)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Description</label>
                  <textarea 
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    placeholder="Provide details on duties and scoping bounds for this security group..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/10"
                  />
                </div>
              </div>

              {modalError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs font-medium text-red-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}
            </form>

            {/* Modal Actions Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-3">
              <Button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2.5 font-semibold text-sm transition-all"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateRoleSubmit}
                isLoading={saving}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6 py-2.5 font-semibold text-sm shadow-md shadow-teal-500/10 transition-all border-none"
              >
                Register Role
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}