import React, { useState, useEffect } from "react";
import { 
  Shield, Plus, CheckCircle2, AlertCircle, X, Search, 
  RefreshCw, Layers, ShieldCheck, Users, Info, Calendar, User
} from "lucide-react";
import Button from "../../core/components/ui/Button";
import Input from "../../core/components/ui/Input";
import axios from "../../core/api/axios";
import { useAuth } from "../../core/context/AuthContext";

// Helper to determine permission group names dynamically
const getGroupName = (action) => {
  const prefix = action.split(":")[0];
  switch (prefix) {
    case "hospital": return "Hospital Management";
    case "branch": return "Branch Management";
    case "clinical": return "Clinical Administration";
    case "billing": return "Financial & Billing";
    case "inventory": return "Pharmacy & Inventory";
    case "iam": 
    case "roles": 
    case "users": 
    case "permissions": 
      return "Identity & Access Management";
    case "themes": return "Theme Settings";
    default: return `${prefix.charAt(0).toUpperCase()}${prefix.slice(1)} Operations`;
  }
};

// Helper to format action names nicely (e.g. "read" -> "View / Read")
const formatActionLabel = (action) => {
  const parts = action.split(":");
  if (parts.length < 2) return action;
  const suffix = parts[1];
  switch (suffix) {
    case "read": return "View / Read";
    case "manage": return "Manage / Full Control";
    case "write": return "Create & Edit";
    case "delete": return "Delete / Remove";
    default: return suffix.charAt(0).toUpperCase() + suffix.slice(1);
  }
};

export default function RolesPermissions() {
  const { user: currentUser } = useAuth();
  
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [permSearchTerm, setPermSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Modal / Creator Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [modalError, setModalError] = useState("");

  // Tracking expanded/collapsed state for each permission group
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch all roles from the database (filtering for tenant scope if backend supports, otherwise get all)
      const rolesRes = await axios.get("/roles");
      const fetchedRoles = rolesRes.data.data.roles || [];
      setRoles(fetchedRoles);

      // Select first role by default
      if (fetchedRoles.length > 0) {
        const defaultRole = fetchedRoles.find(r => r.name === "BRANCH_ADMIN") || fetchedRoles[0];
        await loadRolePermissions(defaultRole.id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load roles.");
      setLoading(false);
    }
  };

  const loadRolePermissions = async (roleId) => {
    setError("");
    try {
      const response = await axios.get(`/roles/${roleId}/permissions`);
      if (response.data.status === "success") {
        const { role: fetchedRole, allPermissions: fetchedPerms } = response.data.data;
        setSelectedRole(fetchedRole);
        setAllPermissions(fetchedPerms);
        setSelectedPermissions(fetchedRole.permissions?.map(p => p.id) || []);
        
        // Initialize all groups as expanded by default
        const groups = {};
        fetchedPerms.forEach(p => {
          groups[getGroupName(p.action)] = true;
        });
        setExpandedGroups(groups);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load role permissions.");
    }
  };

  const handleRoleSelect = async (role) => {
    setSuccess("");
    setError("");
    setSelectedRole(role);
    await loadRolePermissions(role.id);
  };

  const handleTogglePermission = (permissionId) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
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
        // Refresh local roles list to update UI mapping stats
        const rolesRes = await axios.get("/roles");
        setRoles(rolesRes.data.data.roles || []);
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
        description: newRoleDesc
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

  // Group permissions dynamically
  const permissionGroups = {};
  allPermissions.forEach(p => {
    const groupName = getGroupName(p.action);
    if (!permissionGroups[groupName]) {
      permissionGroups[groupName] = [];
    }
    permissionGroups[groupName].push(p);
  });

  // Filter permission groups based on search query
  const filteredGroups = {};
  Object.entries(permissionGroups).forEach(([groupName, perms]) => {
    const matchesGroupName = groupName.toLowerCase().includes(permSearchTerm.toLowerCase());
    const matchedPerms = perms.filter(p => 
      p.action.toLowerCase().includes(permSearchTerm.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(permSearchTerm.toLowerCase()))
    );

    if (matchesGroupName) {
      filteredGroups[groupName] = perms;
    } else if (matchedPerms.length > 0) {
      filteredGroups[groupName] = matchedPerms;
    }
  });

  // Filter roles based on search
  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(roleSearchTerm.toLowerCase())
  );

  const toggleGroupExpand = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleSelectAllGroup = (groupName, perms) => {
    const permIds = perms.map(p => p.id);
    setSelectedPermissions(prev => {
      const filtered = prev.filter(id => !permIds.includes(id));
      return [...filtered, ...permIds];
    });
  };

  const handleClearAllGroup = (groupName, perms) => {
    const permIds = perms.map(p => p.id);
    setSelectedPermissions(prev => prev.filter(id => !permIds.includes(id)));
  };

  const handleSelectAllGlobal = () => {
    setSelectedPermissions(allPermissions.map(p => p.id));
  };

  const handleClearAllGlobal = () => {
    setSelectedPermissions([]);
  };

  // Calculate selected groups count
  const selectedGroupsCount = Object.entries(permissionGroups).filter(([_, perms]) => 
    perms.some(p => selectedPermissions.includes(p.id))
  ).length;

  if (loading && roles.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <Loader className="w-10 h-10 text-teal-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Retrieving system database roles...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-teal-600" />
            Roles & Permissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure security profiles, access control boundaries, and action authority templates.</p>
        </div>
        <Button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-2.5 px-4 font-semibold shadow-md shadow-teal-500/10 transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Create Custom Role
        </Button>
      </div>

      {/* Notifications */}
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

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Roles list */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px] lg:col-span-1">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search roles..."
                value={roleSearchTerm}
                onChange={(e) => setRoleSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {filteredRoles.map((role) => (
              <div 
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className={`w-full text-left px-4 py-3 rounded-xl cursor-pointer transition-all flex justify-between items-center group relative border ${
                  selectedRole?.id === role.id 
                    ? "bg-teal-50 border-teal-200" 
                    : "hover:bg-slate-50 border-transparent"
                }`}
              >
                <div className="space-y-1 overflow-hidden pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-semibold text-xs truncate block ${
                      selectedRole?.id === role.id ? "text-teal-900" : "text-slate-900"
                    }`}>
                      {role.name}
                    </span>
                    {role.scope === "GLOBAL" && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        Global
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{role.description || "No description."}</p>
                </div>
                
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  <Users className="w-3 h-3" />
                  {role.permissions?.length || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Columns: Permissions configuration */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[600px]">
          
          {/* Active Config Header */}
          <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Configure Authority: <span className="text-teal-600">{selectedRole?.name}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-sm">{selectedRole?.description}</p>
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition-all"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
            </Button>
          </div>

          {/* Matrix body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Search and filters header */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-slate-50/30 p-3 rounded-xl border border-slate-100">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Filter permissions..."
                  value={permSearchTerm}
                  onChange={(e) => setPermSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={handleSelectAllGlobal}
                  className="text-[10px] font-bold text-teal-600 hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-200">|</span>
                <button 
                  onClick={handleClearAllGlobal}
                  className="text-[10px] font-bold text-slate-500 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            {Object.keys(filteredGroups).length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <span className="text-xs font-semibold text-slate-500">No permissions match your search query.</span>
              </div>
            ) : (
              Object.entries(filteredGroups).map(([groupName, perms]) => {
                const isExpanded = expandedGroups[groupName];
                const selectedInGroup = perms.filter(p => selectedPermissions.includes(p.id));

                return (
                  <div key={groupName} className="space-y-3.5 border-b border-slate-50 pb-5 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-teal-600" />
                        {groupName}
                        <span className="text-[10px] font-normal text-slate-400 ml-1">
                          ({selectedInGroup.length} of {perms.length} active)
                        </span>
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleSelectAllGroup(groupName, perms)}
                          className="text-[9px] font-bold text-teal-600 hover:underline"
                        >
                          Select All
                        </button>
                        <span className="text-slate-200 text-[9px]">|</span>
                        <button 
                          onClick={() => handleClearAllGroup(groupName, perms)}
                          className="text-[9px] font-bold text-slate-500 hover:underline"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {perms.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.id);
                        return (
                          <label 
                            key={perm.id}
                            className={`flex items-start p-3 border rounded-xl transition-all cursor-pointer select-none ${
                              isChecked 
                                ? "bg-teal-50/10 border-teal-100" 
                                : "border-slate-100 hover:bg-slate-50/40"
                            }`}
                          >
                            <div className="flex items-center h-5 mt-0.5" onClick={() => handleTogglePermission(perm.id)}>
                              <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={() => handleTogglePermission(perm.id)}
                                className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500/20"
                              />
                            </div>
                            <div className="ml-3 text-xs leading-relaxed" onClick={() => handleTogglePermission(perm.id)}>
                              <span className="font-bold text-slate-800 block">{formatActionLabel(perm.action)}</span>
                              <span className="text-slate-400 block mt-0.5 leading-normal">{perm.description || "No description provided."}</span>
                              <span className="font-mono text-[9px] text-teal-600 font-bold block mt-1.5">{perm.action}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* Right Sidebar: Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 lg:col-span-1 text-xs">
          <h3 className="font-extrabold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-600" />
            Permission Summary
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-500">Modules Selected</span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">{selectedGroupsCount}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-500">Permissions Selected</span>
              <span className="font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{selectedPermissions.length}</span>
            </div>

            <div className="flex justify-between items-center border-t border-slate-50 pt-4">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Last Updated
              </span>
              <span className="font-bold text-slate-800">{selectedRole?.updatedAt ? new Date(selectedRole.updatedAt).toLocaleDateString() : "Just now"}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Updated By
              </span>
              <span className="font-bold text-slate-800 truncate max-w-[100px]">{currentUser?.email || "System Admin"}</span>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              onClick={handleSave}
              isLoading={saving}
              disabled={!selectedRole}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-3 font-semibold shadow-md shadow-teal-500/10 transition-all border-none flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save Mapping
            </Button>
          </div>
        </div>

      </div>

      {/* Create Custom Role Slide-over Modal */}
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

// Simple loader helper
const Loader = ({ className }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);