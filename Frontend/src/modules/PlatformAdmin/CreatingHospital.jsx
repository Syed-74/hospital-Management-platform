import React, { useState, useEffect } from 'react';
import { useAuth } from '../../core/context/AuthContext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  X, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  FileText, 
  Globe, 
  ImageIcon, 
  MoreVertical, 
  RotateCcw, 
  ExternalLink, 
  Lightbulb, 
  Layers,
  ChevronDown
} from 'lucide-react';

const INITIAL_FORM_STATE = {
  // Step 1: Basic Info
  hospitalName: '',
  hospitalCode: '',
  legalName: '',
  hospitalType: 'General',
  ownershipType: 'Private',

  // Step 2: Contact
  email: '',
  phone: '',
  alternatePhone: '',

  // Step 3: Location
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',

  // Step 4: Registration & Branding
  registrationNumber: '',
  taxNumber: '',
  licenseNumber: '',
  accreditation: 'None',
  isActive: true,
  isDeleted: false,
  logo: '',
  website: '',
  timezone: 'Asia/Kolkata',
  currency: 'INR'
};

const STEPS = [
  { id: 1, name: 'Basic Information', desc: 'Hospital details & type' },
  { id: 2, name: 'Contact Information', desc: 'Primary contacts' },
  { id: 3, name: 'Location', desc: 'Address & branches' },
  { id: 4, name: 'Additional Settings', desc: 'Features & preferences' }
];

export default function CreatingHospital() {
  const { getAllHospitals, createHospital, updateHospital, deleteHospital } = useAuth();
  
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Logo Upload State
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  
  // UI Extras
  const [showBanner, setShowBanner] = useState(true);
  const [openActionId, setOpenActionId] = useState(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    const result = await getAllHospitals();
    if (result.success) {
      const hospitalList = result.data?.hospitals || result.data || [];
      setHospitals(hospitalList);
      setError(null);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/x-png', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setStepError('Please upload a valid image file (JPG, PNG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStepError('File size should not exceed 5MB.');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setStepError('');
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (stepError) setStepError('');
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (stepToValidate = currentStep) => {
    const errors = {};

    if (stepToValidate === 1) {
      if (!formData.hospitalName?.trim()) {
        errors.hospitalName = 'Hospital Name is required';
      }
      if (!formData.hospitalCode?.trim()) {
        errors.hospitalCode = 'Hospital Code is required';
      }
      if (!formData.hospitalType) {
        errors.hospitalType = 'Hospital Type is required';
      }
    } else if (stepToValidate === 2) {
      if (!formData.email?.trim()) {
        errors.email = 'Email address is required';
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
      if (!formData.phone?.trim()) {
        errors.phone = 'Primary phone number is required';
      }
    } else if (stepToValidate === 3) {
      if (!formData.addressLine1?.trim()) {
        errors.addressLine1 = 'Address Line 1 is required';
      }
      if (!formData.city?.trim()) {
        errors.city = 'City is required';
      }
      if (!formData.state?.trim()) {
        errors.state = 'State / Province is required';
      }
      if (!formData.country?.trim()) {
        errors.country = 'Country is required';
      }
      if (!formData.postalCode?.trim()) {
        errors.postalCode = 'Postal Code is required';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStepError('Please complete all required fields highlighted below before proceeding.');
      return false;
    }

    setFieldErrors({});
    setStepError('');
    return true;
  };

  const validateAllSteps = () => {
    for (let s = 1; s <= 3; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setStepError('');
    setFieldErrors({});
  };

  const handleOpenAddModal = () => {
    setFormData(INITIAL_FORM_STATE);
    setLogoFile(null);
    setLogoPreview('');
    setEditingId(null);
    setCurrentStep(1);
    setStepError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAllSteps()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined && key !== 'isActive' && key !== 'isDeleted' && key !== 'logo') {
        payload.append(key, formData[key]);
      }
    });

    if (logoFile) {
      payload.append('logoFile', logoFile);
    }
    
    let result;
    if (editingId) {
      result = await updateHospital(editingId, payload);
    } else {
      result = await createHospital(payload);
    }
    
    if (result.success) {
      setIsModalOpen(false);
      setFormData(INITIAL_FORM_STATE);
      setLogoFile(null);
      setLogoPreview('');
      setEditingId(null);
      setCurrentStep(1);
      setFieldErrors({});
      setStepError('');
      fetchHospitals();
    } else {
      setStepError(result.message);
    }
    
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this hospital?")) {
      const result = await deleteHospital(id);
      if (result.success) {
        fetchHospitals();
      } else {
        alert(result.message);
      }
    }
  };

  const handleEdit = (hospital) => {
    setFormData({
      hospitalName: hospital.hospitalName || '',
      hospitalCode: hospital.hospitalCode || '',
      legalName: hospital.legalName || '',
      hospitalType: hospital.hospitalType || 'General',
      ownershipType: hospital.ownershipType || 'Private',
      email: hospital.email || '',
      phone: hospital.phone || '',
      alternatePhone: hospital.alternatePhone || '',
      addressLine1: hospital.addressLine1 || '',
      addressLine2: hospital.addressLine2 || '',
      city: hospital.city || '',
      state: hospital.state || '',
      country: hospital.country || '',
      postalCode: hospital.postalCode || '',
      registrationNumber: hospital.registrationNumber || '',
      taxNumber: hospital.taxNumber || '',
      licenseNumber: hospital.licenseNumber || '',
      accreditation: hospital.accreditation || 'None',
      isActive: hospital.isActive !== undefined ? hospital.isActive : true,
      isDeleted: hospital.isDeleted !== undefined ? hospital.isDeleted : false,
      logo: hospital.logo || '',
      website: hospital.website || '',
      timezone: hospital.timezone || 'Asia/Kolkata',
      currency: hospital.currency || 'INR',
    });
    
    if (hospital.logo) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';
      setLogoPreview(hospital.logo.startsWith('http') ? hospital.logo : `${baseUrl}${hospital.logo}`);
    } else {
      setLogoPreview('');
    }
    
    setEditingId(hospital.id);
    setLogoFile(null);
    setCurrentStep(1);
    setStepError('');
    setFieldErrors({});
    setIsModalOpen(true);
    setError(null);
    setOpenActionId(null);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setTypeFilter('All');
    setLocationFilter('All');
  };

  // Filtered List
  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = 
      !searchTerm ||
      h.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.hospitalCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.state?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'All' || 
      (statusFilter === 'Active' && h.isActive !== false) ||
      (statusFilter === 'Inactive' && h.isActive === false);

    const matchesType = 
      typeFilter === 'All' || 
      h.hospitalType === typeFilter;

    const matchesLocation = 
      locationFilter === 'All' || 
      h.state === locationFilter || 
      h.city === locationFilter;

    return matchesSearch && matchesStatus && matchesType && matchesLocation;
  });

  // Calculate Metrics
  const activeCount = hospitals.filter(h => h.isActive !== false).length;
  const inactiveCount = hospitals.filter(h => h.isActive === false).length;
  const totalBranchesCount = hospitals.reduce((acc, h) => acc + (h.branchesCount || h._count?.branches || 1), 0);

  return (  
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-12">
      
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
        <span className="cursor-pointer hover:text-slate-600 transition-colors">Overview</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-700 font-bold">Manage Hospital</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tenant / Hospital Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage hospital organizations and their complete profiles.</p>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-teal-700/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Hospital
        </button>
      </div>

      {/* 4 Summary Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Hospitals */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200/70 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Total Hospitals</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">{loading ? '...' : (hospitals.length > 0 ? hospitals.length : 2)}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Registered hospitals</p>
          </div>
        </div>

        {/* Active Hospitals */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200/70 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Active Hospitals</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">{loading ? '...' : (hospitals.length > 0 ? activeCount : 2)}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Currently operational</p>
          </div>
        </div>

        {/* Inactive Hospitals */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200/70 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Inactive Hospitals</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">{loading ? '...' : inactiveCount}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Temporarily inactive</p>
          </div>
        </div>

        {/* Total Branches */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200/70 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Total Branches</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">{loading ? '...' : totalBranchesCount}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Across all hospitals</p>
          </div>
        </div>

      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search hospitals by name, code, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50/60 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
          />
        </div>

        {/* Dropdowns & Reset */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status Dropdown */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50/80 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 cursor-pointer min-w-[100px]"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Type Dropdown */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Type</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50/80 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 cursor-pointer min-w-[120px]"
            >
              <option value="All">All</option>
              <option value="General">General</option>
              <option value="Multi-Speciality">Multi-Speciality</option>
              <option value="Clinic">Clinic</option>
              <option value="Diagnostic">Diagnostic</option>
            </select>
          </div>

          {/* Location Dropdown */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Location</span>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50/80 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 cursor-pointer min-w-[120px]"
            >
              <option value="All">All</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Telangana">Telangana</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="flex flex-col justify-end">
            <button
              onClick={handleResetFilters}
              className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Reset
            </button>
          </div>

        </div>

      </div>

      {/* Main Data Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200/70 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4" />
            <p className="font-bold text-slate-800 text-sm">Loading hospitals...</p>
          </div>
        ) : error && !isModalOpen ? (
          <div className="p-8 text-center text-red-600 bg-red-50 text-xs font-semibold">
            {error}
            <button onClick={fetchHospitals} className="ml-4 font-bold underline">Retry</button>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-bold text-slate-800">No hospitals found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search term to view hospital records.</p>
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
                    <th className="py-3.5 px-6">Hospital</th>
                    <th className="py-3.5 px-4">Type & Code</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Registration</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredHospitals.map((hospital, idx) => {
                    const avatarInitials = hospital.hospitalName ? hospital.hospitalName.substring(0, 2).toUpperCase() : 'HS';
                    const avatarBgs = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700'];
                    const avatarClass = avatarBgs[idx % avatarBgs.length];

                    return (
                      <tr key={hospital.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Checkbox */}
                        <td className="py-4 px-4">
                          <input type="checkbox" className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer" />
                        </td>

                        {/* Hospital Name & Avatar */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className={`w-9 h-9 rounded-xl border border-slate-200/60 flex items-center justify-center text-xs font-bold shrink-0 ${avatarClass}`}>
                              {avatarInitials}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{hospital.hospitalName}</p>
                              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{hospital.legalName || hospital.hospitalName}</p>
                            </div>
                          </div>
                        </td>

                        {/* Type & Code */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <p className="text-xs font-bold text-slate-800">{hospital.hospitalCode}</p>
                          <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 rounded-md">
                            {hospital.hospitalType || 'Multi-Speciality'}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5 text-slate-600 text-xs">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{hospital.email}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-slate-600 text-xs mt-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{hospital.phone}</span>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-start space-x-1.5 text-slate-700 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-semibold">{hospital.city || 'Hyderabad'}, {hospital.state || 'Telangana'}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{hospital.country || 'India'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Registration */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                          <p className="font-mono text-[11px] text-slate-700 font-semibold">{hospital.registrationNumber || `REG-2023-${hospital.hospitalCode || 'HSP'}`}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{hospital.ownershipType || 'Private'}</p>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            hospital.isActive !== false 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              hospital.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'
                            }`} />
                            {hospital.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap relative">
                          <div className="flex items-center justify-end space-x-1">
                            <button 
                              onClick={() => handleEdit(hospital)}
                              className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(hospital.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
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
              <span>Showing 1 to {filteredHospitals.length} of {hospitals.length} hospitals</span>

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
              <p className="text-xs font-bold text-slate-900">Need help onboarding a new hospital?</p>
              <p className="text-xs text-slate-600 mt-0.5">
                Use the <span className="font-bold text-teal-700">Add Hospital</span> button to create a new hospital and configure its settings, admin users and subscription plan.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 ml-4">
            <button className="px-3.5 py-1.5 text-xs font-bold text-teal-800 bg-white border border-teal-200/80 rounded-xl hover:bg-teal-50 transition-colors flex items-center gap-1.5 shadow-sm">
              View Documentation
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setShowBanner(false)}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Wizard Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 transition-opacity" 
            onClick={() => { setIsModalOpen(false); setEditingId(null); setLogoFile(null); setLogoPreview(''); }}
          />

          {/* Crisp Enterprise Modal Window */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col z-10 border border-slate-200/80">
            
            {/* Modal Header */}
            <div className="px-7 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Hospital' : 'Add New Hospital'}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{editingId ? 'Update hospital details in the system.' : 'Register a complete hospital profile in the system.'}</p>
                </div>
              </div>

              <button 
                onClick={() => { setIsModalOpen(false); setEditingId(null); setLogoFile(null); setLogoPreview(''); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split 2-Column Body */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
              
              {/* Left Vertical Stepper Sidebar */}
              <div className="w-64 bg-slate-50/70 border-r border-slate-100 p-6 flex flex-col space-y-7 shrink-0">
                {STEPS.map((step, idx) => {
                  const isActive = step.id === currentStep;
                  const isCompleted = step.id < currentStep;

                  return (
                    <div key={step.id} className="relative flex items-start space-x-3.5 cursor-pointer" onClick={() => { if (isCompleted) setCurrentStep(step.id); }}>
                      {/* Vertical line connector */}
                      {idx < STEPS.length - 1 && (
                        <div className={`absolute left-3.5 top-8 w-0.5 bottom-[-24px] ${isCompleted ? 'bg-teal-700' : 'bg-slate-200'}`} />
                      )}

                      {/* Step Circle Badge */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-all ${
                        isCompleted 
                          ? 'bg-teal-700 text-white shadow-sm' 
                          : isActive 
                            ? 'bg-teal-700 text-white font-extrabold shadow-sm ring-4 ring-teal-700/10' 
                            : 'bg-white border border-slate-300 text-slate-400'
                      }`}>
                        {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                      </div>

                      {/* Step Text Label */}
                      <div>
                        <p className={`text-xs font-bold leading-tight ${isActive || isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                          {step.name}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Form Content Area */}
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-white">
                
                {/* Info Alert Bar */}
                {/* <div className="mb-6 p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center justify-between text-xs text-teal-900">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                      i
                    </div>
                    <span>You can complete the remaining details in next steps. All fields marked with <span className="text-red-500 font-bold">*</span> are required.</span>
                  </div>
                </div> */}

                {stepError && (
                  <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                    <div className="text-red-500 font-bold mt-0.5 text-xs">!</div>
                    <div className="text-red-700 text-xs font-semibold">{stepError}</div>
                  </div>
                )}

                <form id="wizard-form" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                  
                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Basic Information</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Enter the core details of the hospital organization.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hospital Name <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            name="hospitalName"
                            value={formData.hospitalName}
                            onChange={handleInputChange}
                            className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                              fieldErrors.hospitalName 
                                ? 'bg-red-50/20 border border-red-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                                : 'bg-slate-50/60 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                            }`}
                            placeholder="e.g. CARE Hospitals"
                            autoFocus
                          />
                          {fieldErrors.hospitalName && (
                            <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                              <span>•</span> {fieldErrors.hospitalName}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Legal Name</label>
                          <input 
                            type="text" 
                            name="legalName"
                            value={formData.legalName}
                            onChange={handleInputChange}
                            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50/60 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
                            placeholder="e.g. Quality CARE India Limited"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hospital Code <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            name="hospitalCode"
                            value={formData.hospitalCode}
                            onChange={handleInputChange}
                            className={`w-full px-3.5 py-2.5 text-xs font-mono font-medium rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                              fieldErrors.hospitalCode 
                                ? 'bg-red-50/20 border border-red-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                                : 'bg-slate-50/60 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                            }`}
                            placeholder="e.g. CARE-001"
                          />
                          {fieldErrors.hospitalCode ? (
                            <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                              <span>•</span> {fieldErrors.hospitalCode}
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400 mt-1">Unique code for internal reference (e.g. CARE-001)</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ownership Type <span className="text-red-500">*</span></label>
                          <select 
                            name="ownershipType"
                            value={formData.ownershipType}
                            onChange={handleInputChange}
                            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50/60 border border-slate-200/80 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all cursor-pointer"
                          >
                            <option value="Private">Private</option>
                            <option value="Government">Government</option>
                            <option value="Trust">Trust</option>
                            <option value="NGO">NGO</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hospital Type <span className="text-red-500">*</span></label>
                          <select 
                            name="hospitalType"
                            value={formData.hospitalType}
                            onChange={handleInputChange}
                            className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl text-slate-800 focus:outline-none transition-all cursor-pointer ${
                              fieldErrors.hospitalType 
                                ? 'bg-red-50/20 border border-red-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                                : 'bg-slate-50/60 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                            }`}
                          >
                            <option value="General">General Hospital</option>
                            <option value="Multi-Speciality">Multi-Speciality</option>
                            <option value="Clinic">Clinic</option>
                            <option value="Diagnostic">Diagnostic Center</option>
                          </select>
                          {fieldErrors.hospitalType && (
                            <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                              <span>•</span> {fieldErrors.hospitalType}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Contact Information */}
                  {currentStep === 2 && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Contact Information</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Primary communication details for notifications and administration.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                              type="email" 
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className={`w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                                fieldErrors.email 
                                  ? 'bg-red-50/20 border border-red-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                                  : 'bg-slate-50/60 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                              }`}
                              placeholder="info@carehospitals.com"
                              autoFocus
                            />
                          </div>
                          {fieldErrors.email && (
                            <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                              <span>•</span> {fieldErrors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Phone <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                              type="tel" 
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className={`w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                                fieldErrors.phone 
                                  ? 'bg-red-50/20 border border-red-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                                  : 'bg-slate-50/60 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                              }`}
                              placeholder="+91 40 6810 6589"
                            />
                          </div>
                          {fieldErrors.phone && (
                            <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                              <span>•</span> {fieldErrors.phone}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alternate Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                              type="tel" 
                              name="alternatePhone"
                              value={formData.alternatePhone}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50/60 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
                              placeholder="Optional backup phone"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Location */}
                  {currentStep === 3 && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Location</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Physical address and regional details.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Address Line 1 <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={handleInputChange}
                            className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                              fieldErrors.addressLine1 
                                ? 'bg-red-50/20 border border-red-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                                : 'bg-slate-50/60 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                            }`}
                            placeholder="Street address, building name"
                            autoFocus
                          />
                          {fieldErrors.addressLine1 && (
                            <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                              <span>•</span> {fieldErrors.addressLine1}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Address Line 2</label>
                          <input 
                            type="text" 
                            name="addressLine2"
                            value={formData.addressLine2}
                            onChange={handleInputChange}
                            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50/60 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
                            placeholder="Suite, Floor, Landmark (Optional)"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">City <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                              fieldErrors.city 
                                ? 'bg-red-50/20 border border-red-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                                : 'bg-slate-50/60 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                            }`}
                            placeholder="Hyderabad"
                          />
                          {fieldErrors.city && (
                            <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                              <span>•</span> {fieldErrors.city}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">State / Province <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                              fieldErrors.state 
                                ? 'bg-red-50/20 border border-red-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                                : 'bg-slate-50/60 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                            }`}
                            placeholder="Telangana"
                          />
                          {fieldErrors.state && (
                            <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                              <span>•</span> {fieldErrors.state}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Country <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                              fieldErrors.country 
                                ? 'bg-red-50/20 border border-red-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                                : 'bg-slate-50/60 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                            }`}
                            placeholder="India"
                          />
                          {fieldErrors.country && (
                            <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                              <span>•</span> {fieldErrors.country}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Postal Code <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                              fieldErrors.postalCode 
                                ? 'bg-red-50/20 border border-red-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                                : 'bg-slate-50/60 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600'
                            }`}
                            placeholder="500034"
                          />
                          {fieldErrors.postalCode && (
                            <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                              <span>•</span> {fieldErrors.postalCode}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Additional Settings */}
                  {currentStep === 4 && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Additional Settings</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Registration IDs, logo branding, and preferences.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Registration Number</label>
                          <input 
                            type="text" 
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleInputChange}
                            className="w-full px-3.5 py-2.5 text-xs font-mono font-medium bg-slate-50/60 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
                            placeholder="REG-2023-CARE-001"
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tax Number (GST/VAT)</label>
                          <input 
                            type="text" 
                            name="taxNumber"
                            value={formData.taxNumber}
                            onChange={handleInputChange}
                            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50/60 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
                            placeholder="36AAAAA0000A1Z5"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">License Number</label>
                          <input 
                            type="text" 
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleInputChange}
                            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50/60 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
                            placeholder="LIC-998822"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Accreditation</label>
                          <select 
                            name="accreditation"
                            value={formData.accreditation}
                            onChange={handleInputChange}
                            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50/60 border border-slate-200/80 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all cursor-pointer"
                          >
                            <option value="None">None</option>
                            <option value="NABH">NABH</option>
                            <option value="JCI">JCI</option>
                            <option value="ISO">ISO</option>
                          </select>
                        </div>

                        {/* Logo Box & Preview Grid */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Logo</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Dotted Upload Dropzone Box */}
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/40 p-6 flex flex-col items-center justify-center text-center hover:border-teal-600 transition-colors">
                              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-2 shadow-sm">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                              <label htmlFor="file-upload" className="cursor-pointer text-xs font-bold text-slate-800 hover:text-teal-700">
                                <span>Click to upload logo</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp, image/svg+xml" onChange={handleFileChange} />
                              </label>
                              <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or SVG (Max 5MB)</p>
                            </div>

                            {/* Preview Box */}
                            <div className="border border-slate-200/80 rounded-2xl bg-slate-50/30 p-4 flex flex-col items-center justify-center text-center min-h-[120px]">
                              {logoPreview ? (
                                <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white p-2">
                                  <img src={logoPreview} alt="Preview" className="h-20 w-auto max-w-[140px] object-contain" />
                                  <button type="button" onClick={removeLogo} className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-red-600 hover:bg-white transition-colors" title="Remove">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Preview</p>
                                  <Building2 className="w-8 h-8 text-slate-300 mb-1" />
                                  <p className="text-xs text-slate-400 font-medium">Hospital logo will appear here</p>
                                </>
                              )}
                            </div>

                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Website URL</label>
                          <div className="relative">
                            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                              type="url" 
                              name="website"
                              value={formData.website}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50/60 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
                              placeholder="https://www.carehospitals.com"
                            />
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </form>
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="px-7 py-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
              <div>
                {currentStep > 1 ? (
                  <button 
                    type="button"
                    onClick={handleBack}
                    className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Back
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
              
              <div>
                {currentStep < 4 ? (
                  <button 
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-sm shadow-teal-700/20 flex items-center gap-2"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-sm shadow-teal-700/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Processing...</>
                    ) : (
                      <><Check className="w-4 h-4" /> Save Hospital Profile</>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}