import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../core/context/AuthContext";
import { 
  Shield, CheckCircle2, AlertCircle, Search, Save, X, ChevronDown, 
  ChevronRight, CheckSquare, Square, Info, ShieldCheck, Database, Calendar, User,
  Users, Loader2
} from "lucide-react";
import Button from "../../core/components/ui/Button";
import axios from "../../core/api/axios";

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

export default function AssignPermissionsPage() {
  const { roleId: routeRoleId } = useParams();
  const navigate = useNavigate();
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

  // Tracking expanded/collapsed state for each permission group
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch all roles from the database
      const rolesRes = await axios.get("/roles");
      const fetchedRoles = rolesRes.data.data.roles || [];
      setRoles(fetchedRoles);

      // Determine initial active role
      let initialRole = null;
      if (routeRoleId) {
        initialRole = fetchedRoles.find(r => r.id === routeRoleId);
      }
      if (!initialRole && fetchedRoles.length > 0) {
        // Fallback to HOSPITAL_ADMIN if it exists, otherwise first role
        initialRole = fetchedRoles.find(r => r.name === "HOSPITAL_ADMIN") || fetchedRoles[0];
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
    setLoading(false);
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
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Retrieving system database roles...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
      
      {/* Breadcrumb / Nav */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
        <Link to="/platformAdmin/overview" className="hover:text-slate-600">Platform Admin</Link>
        <span>/</span>
        <span className="text-slate-600">Assign Permissions</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-teal-600" />
            Assign Security Permissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">Dynamically manage authority profiles for database roles within the multi-tenant scope.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate(-1)}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2.5 font-semibold text-sm transition-all"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            isLoading={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6 py-2.5 font-semibold text-sm shadow-md shadow-teal-500/10 transition-all border-none flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Save Permission Map
          </Button>
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

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sidebar: Roles selector list */}
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
            {filteredRoles.map((roleItem) => (
              <div 
                key={roleItem.id}
                onClick={() => handleRoleSelect(roleItem)}
                className={`w-full text-left px-4 py-3 rounded-xl cursor-pointer transition-all flex justify-between items-center group relative border ${
                  selectedRole?.id === roleItem.id 
                    ? "bg-teal-50 border-teal-200" 
                    : "hover:bg-slate-50 border-transparent"
                }`}
              >
                <div className="space-y-1 overflow-hidden pr-2">
                  <span className={`font-semibold text-xs truncate block ${
                    selectedRole?.id === roleItem.id ? "text-teal-900" : "text-slate-900"
                  }`}>
                    {roleItem.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">{roleItem.scope} Scope</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  <Users className="w-3 h-3" />
                  {roleItem.permissions?.length || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Workspace: Permissions selection */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Active Role card context */}
          {selectedRole && (
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-start space-x-3">
              <div className="p-2.5 bg-teal-50 rounded-xl text-teal-600 mt-0.5">
                <Shield className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{selectedRole.name}</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">
                    {selectedRole.scope}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed truncate">{selectedRole.description || "No description provided for this role."}</p>
              </div>
            </div>
          )}

          {/* Search and filters header */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Filter permissions by module or action name..."
                value={permSearchTerm}
                onChange={(e) => setPermSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button 
                onClick={handleSelectAllGlobal}
                className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg py-1.5 px-3 text-[11px] font-semibold"
              >
                Select All
              </Button>
              <Button 
                onClick={handleClearAllGlobal}
                className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg py-1.5 px-3 text-[11px] font-semibold"
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Dynamic Groups list */}
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {Object.keys(filteredGroups).length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <span className="text-sm font-semibold text-slate-500">No permissions match your search query.</span>
              </div>
            ) : (
              Object.entries(filteredGroups).map(([groupName, perms]) => {
                const isExpanded = expandedGroups[groupName];
                const selectedInGroup = perms.filter(p => selectedPermissions.includes(p.id));

                return (
                  <div key={groupName} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all">
                    
                    {/* Group header card */}
                    <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                      <button 
                        onClick={() => toggleGroupExpand(groupName)}
                        className="flex items-center gap-2 font-bold text-slate-800 text-xs hover:text-slate-900 text-left"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        {groupName}
                        <span className="text-[10px] font-normal text-slate-400 ml-1">
                          ({selectedInGroup.length} of {perms.length} active)
                        </span>
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleSelectAllGroup(groupName, perms)}
                          className="text-[10px] font-bold text-teal-600 hover:underline hover:text-teal-700"
                        >
                          Select All
                        </button>
                        <span className="text-slate-200">|</span>
                        <button 
                          onClick={() => handleClearAllGroup(groupName, perms)}
                          className="text-[10px] font-bold text-slate-500 hover:underline hover:text-slate-700"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    {/* Group permissions checklists */}
                    {isExpanded && (
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
                        {perms.map(p => {
                          const isChecked = selectedPermissions.includes(p.id);
                          return (
                            <label 
                              key={p.id}
                              className={`flex items-start p-3 border rounded-xl transition-all cursor-pointer select-none ${
                                isChecked 
                                  ? "bg-teal-50/10 border-teal-100" 
                                  : "border-slate-100 hover:bg-slate-50/40"
                              }`}
                            >
                              <div className="flex items-center h-5 mt-0.5" onClick={() => handleTogglePermission(p.id)}>
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-teal-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300" />
                                )}
                              </div>
                              <div className="ml-3 text-xs leading-relaxed" onClick={() => handleTogglePermission(p.id)}>
                                <span className="font-bold text-slate-800 block">{formatActionLabel(p.action)}</span>
                                <span className="text-slate-400 block mt-0.5 leading-normal">{p.description || "No description provided."}</span>
                                <span className="font-mono text-[9px] text-teal-600 font-bold block mt-1.5">{p.action}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Permission Summary panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 lg:col-span-1">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-600" />
            Permission Summary
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-500">Modules Selected</span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">{selectedGroupsCount}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-500">Permissions Selected</span>
              <span className="font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{selectedPermissions.length}</span>
            </div>

            <div className="flex justify-between items-center text-xs border-t border-slate-50 pt-4">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Last Updated
              </span>
              <span className="font-bold text-slate-800">{selectedRole?.updatedAt ? new Date(selectedRole.updatedAt).toLocaleDateString() : "Just now"}</span>
            </div>

            <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-4">
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

    </div>
  );
}
