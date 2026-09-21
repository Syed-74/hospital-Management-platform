import React, { useState, useEffect } from 'react';
import axios from '../../core/api/axios';
import { useAuth } from '../../core/context/AuthContext';
import { 
  Users, UserPlus, Search, Filter, Edit2, Trash2, X, 
  Check, AlertCircle, Mail, Phone, Building2, Stethoscope, 
  Shield, Key, Lock, Eye, EyeOff, RotateCcw, ChevronDown, 
  UserCheck, UserX, Briefcase, Activity, Sparkles, CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function ManageStaff() {
  const { user: currentUser } = useAuth();

  // Primary API Data States (Strictly from Backend DB - NO Hardcoded Fallbacks)
  const [staffList, setStaffList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [branchesList, setBranchesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  
  // UI & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Input State
  const initialFormState = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    profilePhoto: '',
    departmentId: '',
    branchId: '',
    roleId: '',
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});

  // Revoke Access Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assignmentToRevoke, setAssignmentToRevoke] = useState(null);

  // Fetch Database Records on Component Mount
  useEffect(() => {
    fetchBackendData();
  }, []);

  const fetchBackendData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Execute parallel backend API requests
      const [usersRes, rolesRes, branchesRes, deptsRes] = await Promise.allSettled([
        axios.get('/users'),
        axios.get('/roles'),
        axios.get('/branches'),
        axios.get('/department')
      ]);

      // Process Users API Response
      let fetchedUsers = [];
      if (usersRes.status === 'fulfilled' && usersRes.value?.data?.status === 'success') {
        fetchedUsers = usersRes.value.data.data.users || [];
      } else if (usersRes.status === 'rejected') {
        console.error("Users API Request Failed:", usersRes.reason);
      }

      // Process Roles API Response
      let fetchedRoles = [];
      if (rolesRes.status === 'fulfilled' && rolesRes.value?.data?.status === 'success') {
        fetchedRoles = rolesRes.value.data.data.roles || [];
      }

      // Process Branches API Response
      let fetchedBranches = [];
      if (branchesRes.status === 'fulfilled' && branchesRes.value?.data?.status === 'success') {
        fetchedBranches = branchesRes.value.data.data || branchesRes.value.data.data?.branches || [];
      }

      // Process Departments API Response
      let fetchedDepts = [];
      if (deptsRes.status === 'fulfilled' && deptsRes.value?.data?.status === 'success') {
        fetchedDepts = deptsRes.value.data.data || deptsRes.value.data.data?.departments || [];
      }

      setStaffList(fetchedUsers);
      setRolesList(fetchedRoles);
      setBranchesList(Array.isArray(fetchedBranches) ? fetchedBranches : []);
      setDepartmentsList(Array.isArray(fetchedDepts) ? fetchedDepts : []);

    } catch (err) {
      console.error("Critical error fetching backend data:", err);
      setError(err.response?.data?.message || 'Failed to load staff records from backend database.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBackendData();
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!isEditMode && (!formData.password || formData.password.length < 6)) {
      errors.password = 'Password must be at least 6 characters long';
    }
    if (!formData.roleId) {
      errors.roleId = 'Please select a system role';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Modal for Creating New Staff
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setEditingUserId(null);
    setFormData({
      ...initialFormState,
      roleId: rolesList[0]?.id || '',
      branchId: branchesList[0]?.id || currentUser?.branchId || '',
    });
    setFieldErrors({});
    setError('');
    setIsModalOpen(true);
  };

  // Open Modal for Editing Existing Staff
  const handleOpenEditModal = (user) => {
    setIsEditMode(true);
    setEditingUserId(user.id);
    const activeAssignment = user.roleAssignments?.[0];
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '',
      phone: user.mobileNumber || user.phone || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user.gender || '',
      profilePhoto: user.profilePhoto || '',
      departmentId: user.departmentId || '',
      branchId: activeAssignment?.branchId || currentUser?.branchId || '',
      roleId: activeAssignment?.roleId || rolesList[0]?.id || '',
      isActive: user.isActive !== undefined ? user.isActive : true,
    });
    setFieldErrors({});
    setError('');
    setIsModalOpen(true);
  };

  // Handle Form Submission (Create User & Assign Role via Backend APIs)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      if (!isEditMode) {
        // 1. Create User via /users API
        const userRes = await axios.post('/users', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          mobileNumber: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          profilePhoto: formData.profilePhoto,
          hospitalId: currentUser?.hospitalId || null,
          roleId: formData.roleId,
          branchId: formData.branchId,
        });

        if (userRes.data?.status !== 'success') {
          throw new Error("User creation failed on backend server.");
        }
      } else {
        // 2. Update User via /users/:id API
        await axios.put(`/users/${editingUserId}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          mobileNumber: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          profilePhoto: formData.profilePhoto,
          isActive: formData.isActive,
          roleId: formData.roleId,
          branchId: formData.branchId,
          ...(formData.password ? { password: formData.password } : {})
        });
      }

      setSuccess(isEditMode ? 'Staff details updated successfully!' : 'New staff user onboarded successfully!');
      setIsModalOpen(false);
      fetchBackendData(); // Reload live dataset from database
      setTimeout(() => setSuccess(''), 4000);

    } catch (err) {
      console.error("Failed to process staff user submission:", err);
      setError(err.response?.data?.message || err.message || 'Error processing request. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Revoke Role Assignment via API
  const handleRevokeAssignment = async () => {
    if (!assignmentToRevoke?.assignmentId) return;

    try {
      await axios.delete(`/role-assignments/${assignmentToRevoke.assignmentId}`);
      setSuccess(`Role assignment for ${assignmentToRevoke.userName} revoked successfully.`);
      setIsDeleteModalOpen(false);
      setAssignmentToRevoke(null);
      fetchBackendData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revoke role assignment.');
      setIsDeleteModalOpen(false);
    }
  };

  // Filter Logic over Real Database Array
  const filteredStaff = staffList.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const searchMatch = !searchTerm || 
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const userRoleName = user.roleAssignments?.[0]?.role?.name || 'No Role Assigned';
    const roleMatch = selectedRole === 'All Roles' || userRoleName === selectedRole;
    
    let statusMatch = true;
    if (selectedStatus === 'Active') statusMatch = user.isActive === true;
    if (selectedStatus === 'Inactive') statusMatch = user.isActive === false;

    return searchMatch && roleMatch && statusMatch;
  });

  // Calculate Real-Time Metrics
  const totalUsersCount = staffList.length;
  const activeUsersCount = staffList.filter(u => u.isActive).length;
  const inactiveUsersCount = staffList.filter(u => !u.isActive).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Branch Management</span>
            <span>&gt;</span>
            <span className="text-slate-600">Staff &amp; User Management</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-xs shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff &amp; User Management</h1>
              <p className="text-xs text-slate-500">Live database registry of branch users, system roles, and authorization assignments.</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 self-start md:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard New User</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-2.5 text-emerald-800 text-xs font-semibold shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center gap-2.5 text-rose-800 text-xs font-semibold shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live KPI Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Database Users</span>
            <span className="text-2xl font-bold text-slate-900 tracking-tight mt-1 block">{totalUsersCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Active Staff Accounts</span>
            <span className="text-2xl font-bold text-slate-900 tracking-tight mt-1 block">{activeUsersCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Inactive Accounts</span>
            <span className="text-2xl font-bold text-slate-900 tracking-tight mt-1 block">{inactiveUsersCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search database users by first name, last name, or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs font-medium bg-slate-50/60 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          {/* Role Filter */}
          <div className="relative w-full sm:w-auto min-w-[160px]">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 shadow-xs"
            >
              <option value="All Roles">All Roles ({rolesList.length})</option>
              {rolesList.map(r => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-auto min-w-[130px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 shadow-xs"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

        </div>

      </div>

      {/* Staff User Database Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold flex items-center justify-center space-x-2">
            <Activity className="w-4 h-4 animate-spin text-teal-600" />
            <span>Querying PostgreSQL user database records...</span>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-600">No matching user records found</p>
            <p className="text-[11px] text-slate-400">Database query returned 0 rows for the active filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Assigned Role &amp; Scope</th>
                  <th className="py-3 px-3">Assigned Branch</th>
                  <th className="py-3 px-3 text-center">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStaff.map((user) => {
                  const assignment = user.roleAssignments?.[0];
                  const roleObj = assignment?.role;
                  const roleName = roleObj?.name || 'Unassigned';
                  const roleScope = roleObj?.scope || 'BRANCH';
                  const branchName = assignment?.branch?.branchName || 'All Hospital Branches';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* User Name & Initials Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs border border-white shrink-0">
                            {(user.firstName || 'U')[0]}{(user.lastName || 'U')[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                            <p className="text-[10px] font-mono text-slate-400">ID: {user.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {user.email}
                      </td>

                      {/* Assigned Role & Scope */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-1.5">
                          <Shield className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="font-bold text-slate-800">{roleName}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                          Scope: {roleScope}
                        </span>
                      </td>

                      {/* Branch Scope */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-1 text-slate-600 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{branchName}</span>
                        </div>
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          user.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            title="Edit User & Roles"
                            className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Revoke Role Assignment */}
                          {assignment?.id && (
                            <button
                              onClick={() => {
                                setAssignmentToRevoke({
                                  assignmentId: assignment.id,
                                  userName: `${user.firstName} ${user.lastName}`
                                });
                                setIsDeleteModalOpen(true);
                              }}
                              title="Revoke Role Assignment"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Modal: Onboard / Edit Database User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                  <UserPlus className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isEditMode ? 'Edit User Details & Assignments' : 'Onboard User to Database'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isEditMode ? 'Update user properties and backend role grants' : 'Creates account record in database and assigns RBAC scope'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="e.g. Sarah"
                    className={`w-full px-3.5 py-2 text-xs font-medium bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.firstName ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-teal-600/20 focus:border-teal-600'
                    }`}
                  />
                  {fieldErrors.firstName && <p className="text-[10px] font-bold text-red-500 mt-1">{fieldErrors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="e.g. Connor"
                    className={`w-full px-3.5 py-2 text-xs font-medium bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.lastName ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-teal-600/20 focus:border-teal-600'
                    }`}
                  />
                  {fieldErrors.lastName && <p className="text-[10px] font-bold text-red-500 mt-1">{fieldErrors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sarah.connor@hospital.com"
                    className={`w-full pl-9 pr-3.5 py-2 text-xs font-medium bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.email ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-teal-600/20 focus:border-teal-600'
                    }`}
                  />
                </div>
                {fieldErrors.email && <p className="text-[10px] font-bold text-red-500 mt-1">{fieldErrors.email}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input 
                    type="date" 
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profile Photo URL
                  </label>
                  <input 
                    type="text" 
                    value={formData.profilePhoto}
                    onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
                  />
                </div>
              </div>

              {!isEditMode && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className={`w-full pl-9 pr-9 py-2 text-xs font-medium bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.password ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-teal-600/20 focus:border-teal-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-[10px] font-bold text-red-500 mt-1">{fieldErrors.password}</p>}
                </div>
              )}

              {/* System Role Selection */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    System Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all cursor-pointer"
                  >
                    <option value="">Select a system role...</option>
                    {rolesList.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name} ({role.scope} Scope)
                      </option>
                    ))}
                  </select>
                  {fieldErrors.roleId && <p className="text-[10px] font-bold text-red-500 mt-1">{fieldErrors.roleId}</p>}
                </div>

                {/* Target Branch Selector for BRANCH Scope Roles */}
                {branchesList.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Branch Scope</label>
                    <select
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all cursor-pointer"
                    >
                      {branchesList.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.branchName || b.name} ({b.branchCode || b.code || 'BRANCH'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{isEditMode ? 'Update Record' : 'Create Record'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Revoke Role Confirmation Modal */}
      {isDeleteModalOpen && assignmentToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 text-left">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Revoke Role Assignment?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to revoke the active role assignment for <strong className="text-slate-800">{assignmentToRevoke.userName}</strong>? This calls <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded">DELETE /api/v1/role-assignments/:id</code> on the backend.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-1/2 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeAssignment}
                className="w-1/2 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Confirm Revoke
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}