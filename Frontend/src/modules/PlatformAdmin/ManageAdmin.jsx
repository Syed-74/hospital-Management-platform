import React, { useState, useEffect } from 'react';
import axios from '../../core/api/axios';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  AlertCircle, 
  Building2, 
  User, 
  UserPlus,
  Mail, 
  Phone, 
  BadgeInfo,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  ExternalLink,
  Users,
  Check,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Calendar,
  Briefcase,
  Award,
  ShieldCheck,
  PhoneCall,
  Hash,
  Upload,
  Camera
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';

export default function ManageAdmin() {
  const {
    getAllHospAdmins,
    createHospAdmin,
    UpdateHospAdmin,
    deleteHospAdmin,
    getAllHospitals
  } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewAdmin, setViewAdmin] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  
  // Edit State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [photoInputTab, setPhotoInputTab] = useState('upload'); // 'upload' | 'url'

  // Form State
  const [formData, setFormData] = useState({
    hospitalId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    displayName: '',
    email: '',
    password: '',
    phone: '',
    alternatePhone: '',
    employeeCode: '',
    profilePhoto: '',
    profileImageUrl: '',
    dateOfBirth: '',
    gender: '',
    designation: '',
    department: '',
    qualification: '',
    joiningDate: '',
    officeExtension: '',
    emergencyContact: '',
    roleId: '',
    isActive: true,
    status: 'PENDING',
    isEmailVerified: false,
    isPhoneVerified: false,
    mfaEnabled: false
  });

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch admins and hospitals using Context, fetch roles using axios
      const [adminsRes, hospitalsRes, rolesRes] = await Promise.all([
        getAllHospAdmins(),
        getAllHospitals(),
        axios.get('/roles?scope=HOSPITAL')
      ]);

      if (adminsRes.success) setAdmins(adminsRes.data || []);
      if (hospitalsRes.success) setHospitals(hospitalsRes.data.hospitals || []);
      
      setRoles(rolesRes.data?.data?.roles || rolesRes.data?.data || []);
    } catch (err) {
      setError('Failed to load data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = { 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      };
      if (name === 'profilePhoto' || name === 'profileImageUrl') {
        updated.profilePhoto = value;
        updated.profileImageUrl = value;
      }
      return updated;
    });
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditId(null);
    setShowPassword(false);
    setFormData({
      hospitalId: '', 
      firstName: '', 
      lastName: '', 
      middleName: '', 
      displayName: '', 
      email: '', 
      password: '', 
      phone: '', 
      alternatePhone: '', 
      employeeCode: '', 
      profilePhoto: '', 
      profileImageUrl: '', 
      dateOfBirth: '', 
      gender: '', 
      designation: '', 
      department: '', 
      qualification: '', 
      joiningDate: '', 
      officeExtension: '', 
      emergencyContact: '', 
      roleId: '', 
      isActive: true, 
      status: 'PENDING', 
      isEmailVerified: false, 
      isPhoneVerified: false, 
      mfaEnabled: false
    });
    setError('');
    setStep(1);
    setIsModalOpen(true);
  };

  const openEditModal = (admin) => {
    setIsEditMode(true);
    setEditId(admin.id);
    setShowPassword(false);
    
    // Find the role ID from the admin's roles array if it exists
    const roleId = admin.roles && admin.roles.length > 0 ? admin.roles[0].id : '';
    const photo = admin.profilePhoto || admin.hospitalAdmin?.profileImageUrl || '';

    setFormData({
      hospitalId: admin.hospitalId || admin.hospitalAdmin?.hospitalId || '',
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      middleName: admin.hospitalAdmin?.middleName || '',
      displayName: admin.hospitalAdmin?.displayName || '',
      email: admin.email || '',
      password: '', // Leave empty on edit
      phone: admin.mobileNumber || admin.hospitalAdmin?.alternatePhone || '',
      alternatePhone: admin.hospitalAdmin?.alternatePhone || '',
      employeeCode: admin.hospitalAdmin?.employeeCode || '',
      profilePhoto: photo,
      profileImageUrl: photo,
      dateOfBirth: admin.dateOfBirth ? new Date(admin.dateOfBirth).toISOString().split('T')[0] : '',
      gender: admin.gender || '',
      designation: admin.hospitalAdmin?.designation || '',
      department: admin.hospitalAdmin?.department || '',
      qualification: admin.hospitalAdmin?.qualification || '',
      joiningDate: admin.hospitalAdmin?.joiningDate ? new Date(admin.hospitalAdmin.joiningDate).toISOString().split('T')[0] : '',
      officeExtension: admin.hospitalAdmin?.officeExtension || '',
      emergencyContact: admin.hospitalAdmin?.emergencyContact || '',
      roleId: roleId,
      isActive: admin.isActive !== undefined ? admin.isActive : true,
      status: admin.hospitalAdmin?.status || 'PENDING',
      isEmailVerified: admin.hospitalAdmin?.isEmailVerified || false,
      isPhoneVerified: admin.hospitalAdmin?.isPhoneVerified || false,
      mfaEnabled: admin.hospitalAdmin?.mfaEnabled || false
    });
    setError('');
    setStep(1);
    setIsModalOpen(true);
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (isEditMode || (formData.firstName && formData.lastName && formData.email && formData.password && formData.phone && formData.hospitalId)) {
       setStep(2);
    } else {
       setError("Please fill out all required fields before proceeding.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    let result;
    if (isEditMode) {
      // Don't send empty password or email during update if backend doesn't support changing them here
      const { password, email, ...updateData } = formData;
      result = await UpdateHospAdmin(editId, updateData);
    } else {
      result = await createHospAdmin(formData);
    }

    if (result.success) {
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } else {
      setError(result.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      const result = await deleteHospAdmin(id);
      if (result.success) {
        fetchData();
      } else {
        alert(result.message);
      }
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setHospitalFilter('All');
    setStatusFilter('All');
    setRoleFilter('All');
  };

  // Filtered List
  const filteredAdmins = admins.filter(admin => {
    const adminName = `${admin.firstName || ''} ${admin.lastName || ''}`.toLowerCase();
    const email = (admin.email || '').toLowerCase();
    const empCode = (admin.hospitalAdmin?.employeeCode || '').toLowerCase();
    const hospName = (admin.hospital?.hospitalName || '').toLowerCase();
    const designation = (admin.hospitalAdmin?.designation || '').toLowerCase();
    const department = (admin.hospitalAdmin?.department || '').toLowerCase();

    const matchesSearch = 
      !searchTerm ||
      adminName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      empCode.includes(searchTerm.toLowerCase()) ||
      hospName.includes(searchTerm.toLowerCase()) ||
      designation.includes(searchTerm.toLowerCase()) ||
      department.includes(searchTerm.toLowerCase());

    const matchesHospital = 
      hospitalFilter === 'All' || 
      admin.hospitalId === hospitalFilter;

    const matchesStatus = 
      statusFilter === 'All' || 
      (statusFilter === 'Active' && admin.isActive !== false) ||
      (statusFilter === 'Inactive' && admin.isActive === false);

    const matchesRole = 
      roleFilter === 'All' || 
      (admin.roles && admin.roles.some(r => r.id === roleFilter || r.name === roleFilter));

    return matchesSearch && matchesHospital && matchesStatus && matchesRole;
  });

  const activeCount = admins.filter(a => a.isActive !== false).length;
  const inactiveCount = admins.filter(a => a.isActive === false).length;
  const hospitalsWithAdminsCount = new Set(admins.map(a => a.hospitalId).filter(Boolean)).size;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-12">
      
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Overview</span>
            <span>&gt;</span>
            <span className="text-teal-700 font-bold">Manage Admins</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Hospital Admins</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, update, and manage hospital administrators and their role assignments.
          </p>
        </div>

        <button 
          onClick={openCreateModal}
          className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-teal-700/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Admin
        </button>
      </div>

      {/* 4 Summary Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Admins */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200/70 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Total Admins</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">{isLoading ? '...' : (admins.length > 0 ? admins.length : 0)}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Across all hospitals</p>
          </div>
        </div>

        {/* Active Admins */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200/70 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Active Admins</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">{isLoading ? '...' : activeCount}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Currently active</p>
          </div>
        </div>

        {/* Inactive Admins */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200/70 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Inactive Admins</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">{isLoading ? '...' : inactiveCount}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Temporarily disabled</p>
          </div>
        </div>

        {/* Hospitals with Admins */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200/70 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Hospitals with Admins</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">{isLoading ? '...' : hospitalsWithAdminsCount}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Out of {hospitals.length} hospitals</p>
          </div>
        </div>

      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name, email, employee ID, hospital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50/60 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
          />
        </div>

        {/* Dropdowns & Reset */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Hospital Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">Hospital</span>
            <select 
              value={hospitalFilter}
              onChange={(e) => setHospitalFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all cursor-pointer"
            >
              <option value="All">All Hospitals</option>
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>{h.hospitalName}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">Status</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Role Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">Role</span>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all cursor-pointer"
            >
              <option value="All">All Roles</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <button 
            onClick={handleResetFilters}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset
          </button>

        </div>
      </div>

      {error && !isModalOpen && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start border border-red-100 shadow-sm text-xs font-semibold">
          <AlertCircle className="w-4 h-4 mr-2.5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200/70 overflow-hidden">
        
        {filteredAdmins.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Administrators Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">No hospital administrators match your search or filter criteria. Create a new admin or reset filters.</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-10">
                      <input type="checkbox" className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer" />
                    </th>
                    <th className="py-3.5 px-6">Profile & Admin</th>
                    <th className="py-3.5 px-4">Designation / Dept</th>
                    <th className="py-3.5 px-4">Contact Details</th>
                    <th className="py-3.5 px-4">Hospital & Scope</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredAdmins.map((admin, idx) => {
                    const initials = `${admin.firstName?.charAt(0) || ''}${admin.lastName?.charAt(0) || ''}`.toUpperCase() || 'AD';
                    const avatarBgs = ['bg-teal-100 text-teal-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700'];
                    const avatarClass = avatarBgs[idx % avatarBgs.length];

                    const profilePhotoUrl = admin.profilePhoto || admin.hospitalAdmin?.profileImageUrl;
                    const phoneNum = admin.mobileNumber || admin.hospitalAdmin?.phone || admin.hospitalAdmin?.alternatePhone;

                    return (
                      <tr key={admin.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Checkbox */}
                        <td className="py-4 px-4">
                          <input type="checkbox" className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer" />
                        </td>

                        {/* Profile & Admin Name */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {profilePhotoUrl ? (
                              <img
                                src={profilePhotoUrl}
                                alt={`${admin.firstName} ${admin.lastName}`}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200/80 shadow-sm shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-10 h-10 rounded-xl border border-slate-200/60 flex items-center justify-center text-xs font-bold shrink-0 ${avatarClass}`}
                              style={{ display: profilePhotoUrl ? 'none' : 'flex' }}
                            >
                              {initials}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                {admin.firstName} {admin.lastName}
                                {admin.hospitalAdmin?.displayName && (
                                  <span className="text-[10px] text-slate-400 font-normal">({admin.hospitalAdmin.displayName})</span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                ID: {admin.hospitalAdmin?.employeeCode || `EMP-${(admin.firstName || 'ADM').substring(0,4).toUpperCase()}-00${idx+1}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Designation / Dept */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <p className="text-xs font-bold text-slate-800">
                            {admin.hospitalAdmin?.designation || 'Hospital Admin'}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {admin.hospitalAdmin?.department ? `Dept: ${admin.hospitalAdmin.department}` : 'General Admin'}
                          </p>
                        </td>

                        {/* Contact */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5 text-slate-600 text-xs">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{admin.email}</span>
                          </div>
                          {phoneNum && (
                            <div className="flex items-center space-x-1.5 text-slate-600 text-xs mt-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{phoneNum}</span>
                            </div>
                          )}
                        </td>

                        {/* Hospital & Role */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5 text-slate-800 font-bold text-xs">
                            <Building2 className="w-3.5 h-3.5 text-teal-600" />
                            <span>{admin.hospital?.hospitalName || 'Enterprise Hospital'}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5 pl-5">
                            Role: {admin.roles && admin.roles.length > 0 ? admin.roles[0].name : 'Hospital Admin'}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            admin.isActive !== false 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              admin.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'
                            }`} />
                            {admin.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button 
                              onClick={() => setViewAdmin(admin)}
                              className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                              title="View Full Profile Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openEditModal(admin)}
                              className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Admin"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(admin.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Admin"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
              <span>Showing 1 to {filteredAdmins.length} of {admins.length} admins</span>

              <div className="flex items-center space-x-2">
                <button className="w-8 h-8 rounded-lg border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-teal-700 text-white font-bold flex items-center justify-center shadow-sm">
                  1
                </button>
                <button className="w-8 h-8 rounded-lg border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40" disabled>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <select className="ml-2 px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200/80 rounded-lg text-slate-700 focus:outline-none cursor-pointer">
                  <option value="10">10 / page</option>
                  <option value="25">25 / page</option>
                  <option value="50">50 / page</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Onboarding Help Alert Banner */}
      {showBanner && (
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Need help managing admins?</p>
              <p className="text-xs text-slate-600 mt-0.5">
                Assign hospital admins, manage their profile details and roles, and control their access to platform features.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 ml-4">
            <button className="px-3.5 py-1.5 text-xs font-bold text-teal-800 bg-white border border-teal-200/80 rounded-xl hover:bg-teal-50 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer">
              View Documentation
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setShowBanner(false)}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-slate-900/60 transition-opacity" 
            onClick={() => setViewAdmin(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col z-10 border border-slate-200/80">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-teal-700 to-teal-900 p-6 text-white relative">
              <button 
                onClick={() => setViewAdmin(null)} 
                className="absolute right-4 top-4 p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-4">
                {(viewAdmin.profilePhoto || viewAdmin.hospitalAdmin?.profileImageUrl) ? (
                  <img 
                    src={viewAdmin.profilePhoto || viewAdmin.hospitalAdmin?.profileImageUrl} 
                    alt={`${viewAdmin.firstName} ${viewAdmin.lastName}`} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-xl font-bold text-white shrink-0">
                    {`${viewAdmin.firstName?.charAt(0) || ''}${viewAdmin.lastName?.charAt(0) || ''}`}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-extrabold">{viewAdmin.firstName} {viewAdmin.lastName}</h3>
                  {viewAdmin.hospitalAdmin?.displayName && (
                    <p className="text-xs text-teal-100">DisplayName: {viewAdmin.hospitalAdmin.displayName}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="bg-white/20 text-white text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
                      {viewAdmin.hospitalAdmin?.designation || 'Hospital Admin'}
                    </span>
                    <span className="bg-emerald-400/20 text-emerald-200 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                      {viewAdmin.hospital?.hospitalName || 'Enterprise Hospital'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Personal Information */}
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-700" /> Personal Information
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Full Name</span>
                    <span className="font-bold text-slate-800">{viewAdmin.firstName} {viewAdmin.hospitalAdmin?.middleName || ''} {viewAdmin.lastName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Date of Birth</span>
                    <span className="font-bold text-slate-800">
                      {viewAdmin.dateOfBirth ? new Date(viewAdmin.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Gender</span>
                    <span className="font-bold text-slate-800 capitalize">{viewAdmin.gender || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-teal-700" /> Professional Details
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Employee Code</span>
                    <span className="font-bold text-slate-800">{viewAdmin.hospitalAdmin?.employeeCode || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Department</span>
                    <span className="font-bold text-slate-800">{viewAdmin.hospitalAdmin?.department || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Qualification</span>
                    <span className="font-bold text-slate-800">{viewAdmin.hospitalAdmin?.qualification || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Joining Date</span>
                    <span className="font-bold text-slate-800">
                      {viewAdmin.hospitalAdmin?.joiningDate ? new Date(viewAdmin.hospitalAdmin.joiningDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Office Extension</span>
                    <span className="font-bold text-slate-800">{viewAdmin.hospitalAdmin?.officeExtension || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Account Status</span>
                    <span className="font-bold text-teal-700">{viewAdmin.hospitalAdmin?.status || 'PENDING'}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-700" /> Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Email Address</span>
                    <span className="font-bold text-slate-800">{viewAdmin.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Primary Phone (Mobile)</span>
                    <span className="font-bold text-slate-800">{viewAdmin.mobileNumber || viewAdmin.hospitalAdmin?.alternatePhone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Alternate Phone</span>
                    <span className="font-bold text-slate-800">{viewAdmin.hospitalAdmin?.alternatePhone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Emergency Contact</span>
                    <span className="font-bold text-slate-800">{viewAdmin.hospitalAdmin?.emergencyContact || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Account & Security Badges */}
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700" /> Security & Verification
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`px-3 py-1 rounded-xl font-bold border ${viewAdmin.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {viewAdmin.isActive !== false ? '✓ Account Active' : '✕ Account Disabled'}
                  </span>
                  <span className={`px-3 py-1 rounded-xl font-bold border ${viewAdmin.hospitalAdmin?.isEmailVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {viewAdmin.hospitalAdmin?.isEmailVerified ? '✓ Email Verified' : '⚠ Email Unverified'}
                  </span>
                  <span className={`px-3 py-1 rounded-xl font-bold border ${viewAdmin.hospitalAdmin?.isPhoneVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {viewAdmin.hospitalAdmin?.isPhoneVerified ? '✓ Phone Verified' : '⚠ Phone Unverified'}
                  </span>
                  <span className={`px-3 py-1 rounded-xl font-bold border ${viewAdmin.hospitalAdmin?.mfaEnabled ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {viewAdmin.hospitalAdmin?.mfaEnabled ? '🔐 MFA Enabled' : 'MFA Off'}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button 
                onClick={() => {
                  const adminToEdit = viewAdmin;
                  setViewAdmin(null);
                  openEditModal(adminToEdit);
                }}
                className="px-4 py-2 bg-teal-700 text-white font-bold rounded-xl text-xs hover:bg-teal-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
              <button 
                onClick={() => setViewAdmin(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />

          {/* Crisp Enterprise Modal Window */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col z-10 border border-slate-200/80">
            
            {/* Header */}
            <div className="px-7 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {isEditMode ? 'Edit Hospital Admin' : 'Create Hospital Admin'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isEditMode ? 'Update hospital administrator profile and configuration.' : 'Add a new hospital administrator and assign them to a hospital.'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Header Bar */}
            <div className="px-7 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-center shrink-0">
              <div className="flex items-center justify-between w-full max-w-md relative">
                
                {/* Step 1 */}
                <div className="flex flex-col items-center z-10 cursor-pointer" onClick={() => setStep(1)}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === 1 ? 'bg-teal-700 text-white shadow-sm ring-4 ring-teal-700/10' : 'bg-teal-700 text-white'
                  }`}>
                    1
                  </div>
                  <span className={`text-[11px] font-bold mt-1 ${step === 1 ? 'text-teal-700' : 'text-slate-500'}`}>
                    Profile & Hospital Details
                  </span>
                </div>

                {/* Connector Line */}
                <div className={`h-0.5 flex-1 mx-4 -mt-4 transition-colors ${step === 2 ? 'bg-teal-700' : 'bg-slate-200'}`} />

                {/* Step 2 */}
                <div className="flex flex-col items-center z-10 cursor-pointer" onClick={() => { if (isEditMode || (formData.firstName && formData.lastName)) setStep(2); }}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === 2 ? 'bg-teal-700 text-white shadow-sm ring-4 ring-teal-700/10' : 'bg-white border border-slate-300 text-slate-400'
                  }`}>
                    2
                  </div>
                  <span className={`text-[11px] font-medium mt-1 ${step === 2 ? 'text-teal-700 font-bold' : 'text-slate-400'}`}>
                    Assign Role & Permissions
                  </span>
                </div>

              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(92vh-190px)] space-y-4 bg-slate-50/30">
              {error && (
                <div className="mb-4 bg-red-50 text-red-600 p-3.5 rounded-xl flex items-center border border-red-100 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form id="admin-form" onSubmit={handleSubmit} className="space-y-4">
                {/* STEP 1: Basic & Profile Details */}
                {step === 1 && (
                  <>
                    {/* Card 1: Identity & Avatar Details */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 mb-2">
                          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 mt-0.5">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 tracking-wider uppercase">IDENTITY & PROFILE PHOTO</h4>
                            <p className="text-[11px] text-slate-400 font-medium">Enter personal identity and profile details.</p>
                          </div>
                        </div>

                        {/* Profile Photo Live Preview */}
                        {(formData.profilePhoto || formData.profileImageUrl) && (
                          <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                            <img 
                              src={formData.profilePhoto || formData.profileImageUrl} 
                              alt="Preview" 
                              className="w-10 h-10 rounded-lg object-cover"
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=Invalid'; }}
                            />
                            <span className="text-[10px] font-bold text-slate-500 pr-2">Photo Preview</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" placeholder="John" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Middle Name</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" placeholder="Middle" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" placeholder="Doe" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Display Name</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="text" name="displayName" value={formData.displayName} onChange={handleInputChange}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" placeholder="Dr. John Doe" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                          <div className="relative">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
                          <div className="relative">
                            <select name="gender" value={formData.gender} onChange={handleInputChange}
                              className="w-full px-3 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all cursor-pointer">
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Profile Photo Setup System (Upload File or URL) */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-teal-600" />
                            Profile Photo Setup
                          </label>
                          <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => setPhotoInputTab('upload')}
                              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${photoInputTab === 'upload' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                              Upload File
                            </button>
                            <button
                              type="button"
                              onClick={() => setPhotoInputTab('url')}
                              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${photoInputTab === 'url' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                              Image URL
                            </button>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                          {/* Avatar Preview Box */}
                          <div className="relative shrink-0">
                            {(formData.profilePhoto || formData.profileImageUrl) ? (
                              <div className="relative">
                                <img
                                  src={formData.profilePhoto || formData.profileImageUrl}
                                  alt="Profile Avatar Preview"
                                  className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-600/30 shadow-md"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/150?text=Invalid';
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, profilePhoto: '', profileImageUrl: '' }))}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors cursor-pointer"
                                  title="Remove Photo"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-2xl bg-teal-50/80 border-2 border-dashed border-teal-200 flex flex-col items-center justify-center text-teal-600 shrink-0">
                                <User className="w-7 h-7 text-teal-600" />
                                <span className="text-[9px] font-bold text-teal-700 mt-0.5">No Photo</span>
                              </div>
                            )}
                          </div>

                          {/* Controls tab */}
                          <div className="flex-1 space-y-2">
                            {photoInputTab === 'upload' ? (
                              <div>
                                <label className="flex flex-col items-center justify-center w-full px-4 py-3 bg-white border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-xl cursor-pointer transition-all hover:bg-teal-50/30">
                                  <div className="flex items-center space-x-2 text-slate-700">
                                    <Upload className="w-4 h-4 text-teal-600" />
                                    <span className="text-xs font-bold text-slate-800">Choose / Drag Profile Image</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP, SVG (Max 5MB)</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        if (file.size > 10 * 1024 * 1024) {
                                          setError('Selected image size exceeds 10MB limit.');
                                          return;
                                        }
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          const img = new Image();
                                          img.onload = () => {
                                            const canvas = document.createElement('canvas');
                                            const MAX = 800;
                                            let w = img.width;
                                            let h = img.height;
                                            if (w > h) {
                                              if (w > MAX) { h *= MAX / w; w = MAX; }
                                            } else {
                                              if (h > MAX) { w *= MAX / h; h = MAX; }
                                            }
                                            canvas.width = w;
                                            canvas.height = h;
                                            const ctx = canvas.getContext('2d');
                                            ctx.drawImage(img, 0, 0, w, h);
                                            const compressedDataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85);
                                            setFormData(prev => ({
                                              ...prev,
                                              profilePhoto: compressedDataUrl,
                                              profileImageUrl: compressedDataUrl
                                            }));
                                          };
                                          img.src = event.target.result;
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            ) : (
                              <div className="relative">
                                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                  type="url"
                                  name="profilePhoto"
                                  value={formData.profilePhoto || formData.profileImageUrl}
                                  onChange={handleInputChange}
                                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
                                  placeholder="https://example.com/avatar.jpg"
                                />
                              </div>
                            )}
                            <p className="text-[10px] text-slate-400">
                              {photoInputTab === 'upload' 
                                ? 'Upload an image file directly from your system to set as profile photo.'
                                : 'Paste a direct web link (URL) of an image to set as profile photo.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Professional Information */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                      <div className="flex items-start space-x-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 mt-0.5">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 tracking-wider uppercase">PROFESSIONAL DETAILS</h4>
                          <p className="text-[11px] text-slate-400 font-medium">Specify administrative position, department, and credentials.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Employee Code</label>
                          <div className="relative">
                            <BadgeInfo className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="text" name="employeeCode" value={formData.employeeCode} onChange={handleInputChange}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" placeholder="EMP-10203" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Designation</label>
                          <div className="relative">
                            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="text" name="designation" value={formData.designation} onChange={handleInputChange}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" placeholder="Chief Medical Officer" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
                          <div className="relative">
                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="text" name="department" value={formData.department} onChange={handleInputChange}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" placeholder="Administration / Cardiology" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Qualification</label>
                          <div className="relative">
                            <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" placeholder="MBBS, MHA" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Joining Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Office Extension</label>
                          <div className="relative">
                            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="text" name="officeExtension" value={formData.officeExtension} onChange={handleInputChange}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" placeholder="Ext 402" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Contact Details */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                      <div className="flex items-start space-x-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 mt-0.5">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 tracking-wider uppercase">CONTACT DETAILS</h4>
                          <p className="text-[11px] text-slate-400 font-medium">Provide contact information for communication and notifications.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input required={!isEditMode} disabled={isEditMode} type="email" name="email" value={formData.email} onChange={handleInputChange}
                              className={`w-full pl-10 pr-3.5 py-2.5 border border-slate-200/80 rounded-xl text-xs font-medium transition-all outline-none ${isEditMode ? 'bg-slate-100 text-slate-500' : 'bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'}`} placeholder="admin@hospital.com" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Mobile Phone <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" placeholder="+91 91234 56789" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alternate Phone</label>
                          <div className="relative">
                            <PhoneCall className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="text" name="alternatePhone" value={formData.alternatePhone} onChange={handleInputChange}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" placeholder="Backup phone" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Emergency Contact</label>
                        <div className="relative">
                          <PhoneCall className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" placeholder="Name & Phone (+91 99887 76655)" />
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Account Security & Assignment */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                      <div className="flex items-start space-x-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 mt-0.5">
                          <Settings className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 tracking-wider uppercase">ACCOUNT & ASSIGNMENT</h4>
                          <p className="text-[11px] text-slate-400 font-medium">Set account credentials and assign to a hospital.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {!isEditMode && (
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Temporary Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <input required type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange}
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" placeholder="••••••••" />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assign to Hospital <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <select required name="hospitalId" value={formData.hospitalId} onChange={handleInputChange} disabled={isEditMode}
                              className={`w-full pl-10 pr-3.5 py-2.5 border border-slate-200/80 rounded-xl text-xs font-medium transition-all outline-none cursor-pointer ${isEditMode ? 'bg-slate-100 text-slate-500' : 'bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'}`}>
                              <option value="">Select a Hospital</option>
                              {hospitals.map(h => (
                                <option key={h.id} value={h.id}>{h.hospitalName} ({h.hospitalCode})</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Status</label>
                          <div className="relative">
                            <Settings className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <select name="status" value={formData.status} onChange={handleInputChange}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all cursor-pointer">
                              <option value="PENDING">Pending</option>
                              <option value="ACTIVE">Active</option>
                              <option value="INACTIVE">Inactive</option>
                              <option value="SUSPENDED">Suspended</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-2 border-t border-slate-100">
                        <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleInputChange}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer" />
                          <span>Login Active</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input type="checkbox" id="mfaEnabled" name="mfaEnabled" checked={formData.mfaEnabled} onChange={handleInputChange}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer" />
                          <span>MFA Enabled</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input type="checkbox" id="isEmailVerified" name="isEmailVerified" checked={formData.isEmailVerified} onChange={handleInputChange}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer" />
                          <span>Email Verified</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input type="checkbox" id="isPhoneVerified" name="isPhoneVerified" checked={formData.isPhoneVerified} onChange={handleInputChange}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer" />
                          <span>Phone Verified</span>
                        </label>
                      </div>
                    </div>

                  </>
                )}

                {/* STEP 2: Roles and Permissions */}
                {step === 2 && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                    <div className="flex items-start space-x-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 tracking-wider uppercase">ROLE ASSIGNMENT & PERMISSIONS</h4>
                        <p className="text-[11px] text-slate-400 font-medium">Assign dynamic role permissions for this administrator.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assign Role <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <select required name="roleId" value={formData.roleId} onChange={handleInputChange} disabled={isEditMode}
                          className={`w-full pl-10 pr-3.5 py-2.5 border border-slate-200/80 rounded-xl text-xs font-medium transition-all outline-none cursor-pointer ${isEditMode ? 'bg-slate-100 text-slate-500' : 'bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'}`}>
                          <option value="">Select a Role</option>
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name} {r.description ? `(${r.description})` : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {formData.roleId && (
                      <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                          <h4 className="text-xs font-bold text-slate-800">Granted Permissions Review</h4>
                          <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            Read-Only
                          </span>
                        </div>
                        <div className="max-h-60 overflow-y-auto p-4 bg-white">
                          {roles.find(r => r.id === formData.roleId)?.rolePermissions?.length > 0 ? (
                            <ul className="space-y-3">
                              {roles.find(r => r.id === formData.roleId).rolePermissions.map(rp => (
                                <li key={rp.permission.id} className="flex items-start">
                                  <div className="flex-shrink-0 h-4 w-4 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center mr-2.5 mt-0.5">
                                    <Check className="w-3 h-3" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-900">{rp.permission.action}</p>
                                    {rp.permission.description && <p className="text-[11px] text-slate-500 mt-0.5">{rp.permission.description}</p>}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-500 text-center py-4 font-medium">No specific permissions attached to this role.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Footer Actions Bar */}
            <div className="px-7 py-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
              {step === 1 ? (
                <>
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button type="button" onClick={handleNextStep}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-sm shadow-teal-700/20 transition-all flex items-center gap-2 cursor-pointer">
                    Next: Assign Role <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setStep(1)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                    Back
                  </button>
                  <button type="submit" form="admin-form" onClick={handleSubmit}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-sm shadow-teal-700/20 transition-all flex items-center gap-2 cursor-pointer">
                    <Check className="w-4 h-4" /> {isEditMode ? 'Save Changes' : 'Create Administrator'}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}