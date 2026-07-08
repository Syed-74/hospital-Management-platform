import React, { useState, useEffect } from 'react';
import { useAuth } from '../../core/context/AuthContext';
import { Plus, Search, Edit2, Trash2, Building2, MapPin, Phone, Mail, X, Check, ChevronRight, FileText, Globe, Upload, Image as ImageIcon } from 'lucide-react';

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
  { id: 1, name: 'Basic Info' },
  { id: 2, name: 'Contact' },
  { id: 3, name: 'Location' },
  { id: 4, name: 'Registration' }
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
  
  // Logo Upload State
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
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
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (stepError) setStepError(''); // clear error on type
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.hospitalName || !formData.hospitalCode || !formData.hospitalType) {
        setStepError('Please fill in all required basic information fields.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.email || !formData.phone) {
        setStepError('Please provide both email and primary phone number.');
        return false;
      }
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        setStepError('Please provide a valid email address.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.addressLine1 || !formData.city || !formData.state || !formData.country || !formData.postalCode) {
        setStepError('Please complete all required location fields.');
        return false;
      }
    } else if (currentStep === 4) {
      // Registration fields are technically optional in DB, but we can validate format if needed
    }
    setStepError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setStepError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    // Use FormData for file upload
    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      // Skip empty optional fields and internal UI state
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
    setLogoFile(null); // Reset any previously selected file
    setCurrentStep(1);
    setStepError('');
    setIsModalOpen(true);
    setError(null);
  };

  const filteredHospitals = hospitals.filter(h => 
    h.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.hospitalCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (  
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Tenant Management
          </h1>
          <p className="text-gray-500 mt-1">Manage hospital organizations and their complete profiles.</p>
        </div>
        <button 
          onClick={() => {
            setFormData(INITIAL_FORM_STATE);
            setLogoFile(null);
            setLogoPreview('');
            setEditingId(null);
            setCurrentStep(1);
            setStepError('');
            setIsModalOpen(true);
            setError(null);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Hospital
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
        <div className="relative w-96">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search hospitals by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="font-medium text-gray-900">Loading hospitals...</p>
          </div>
        ) : error && !isModalOpen ? (
          <div className="p-8 text-center text-red-500 bg-red-50">
            {error}
            <button onClick={fetchHospitals} className="ml-4 font-medium underline">Retry</button>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900">No hospitals found</p>
            <p className="text-sm mt-1">Try adjusting your search or add a new hospital to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Hospital</th>
                  <th className="py-4 px-6">Type & Code</th>
                  <th className="py-4 px-6">Contact</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Registration</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHospitals.map((hospital) => (
                  <tr key={hospital.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{hospital.hospitalName}</div>
                      {hospital.legalName && <div className="text-xs text-gray-500 mt-0.5">{hospital.legalName}</div>}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-900 font-mono text-sm">{hospital.hospitalCode}</div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        {hospital.hospitalType}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {hospital.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {hospital.phone}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                        <span>{hospital.city}, {hospital.state}<br/><span className="text-xs text-gray-400">{hospital.country}</span></span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {hospital.registrationNumber ? (
                         <div className="font-mono text-xs">{hospital.registrationNumber}</div>
                      ) : <span className="text-gray-400 text-xs italic">N/A</span>}
                      {hospital.ownershipType && (
                        <div className="text-xs text-gray-500 mt-1">{hospital.ownershipType}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(hospital)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors tooltip-trigger" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(hospital.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Wizard Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col transform transition-all">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Hospital' : 'Add New Hospital'}</h2>
                <p className="text-sm text-gray-500 mt-1">{editingId ? 'Update hospital details in the system.' : 'Register a complete hospital profile in the system.'}</p>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingId(null); setLogoFile(null); setLogoPreview(''); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100">
              <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 z-0"></div>
                
                {/* Progress Bar Active */}
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 z-0 transition-all duration-300"
                  style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                ></div>

                {STEPS.map((step) => {
                  const isActive = step.id === currentStep;
                  const isCompleted = step.id < currentStep;

                  return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 ${
                          isCompleted 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : isActive 
                              ? 'bg-white border-blue-600 text-blue-600' 
                              : 'bg-white border-gray-300 text-gray-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                      </div>
                      <span 
                        className={`absolute top-12 whitespace-nowrap text-xs font-medium ${
                          isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Body / Wizard Content */}
            <div className="p-8 overflow-y-auto flex-1">
              {stepError && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3">
                  <div className="text-red-500 font-bold mt-0.5">!</div>
                  <div className="text-red-700 text-sm font-medium">{stepError}</div>
                </div>
              )}

              <form id="wizard-form" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" /> Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Hospital Name <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="hospitalName"
                          value={formData.hospitalName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                          placeholder="e.g. Apollo City Hospital"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Legal Name</label>
                        <input 
                          type="text" 
                          name="legalName"
                          value={formData.legalName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                          placeholder="Registered Legal Entity Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Hospital Code <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="hospitalCode"
                          value={formData.hospitalCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono transition-colors"
                          placeholder="e.g. APH-001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Ownership Type</label>
                        <select 
                          name="ownershipType"
                          value={formData.ownershipType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        >
                          <option value="Private">Private</option>
                          <option value="Government">Government</option>
                          <option value="Trust">Trust</option>
                          <option value="NGO">NGO</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Hospital Type <span className="text-red-500">*</span></label>
                        <select 
                          name="hospitalType"
                          value={formData.hospitalType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        >
                          <option value="General">General Hospital</option>
                          <option value="Multi-Speciality">Multi-Speciality</option>
                          <option value="Clinic">Clinic</option>
                          <option value="Diagnostic">Diagnostic Center</option>
                          <option value="Dental">Dental Care</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Contact Info */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-blue-600" /> Contact Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                            placeholder="admin@hospital.com"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Phone <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            type="tel" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Alternate Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            type="tel" 
                            name="alternatePhone"
                            value={formData.alternatePhone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                            placeholder="Optional backup number"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Location */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" /> Location & Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 1 <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="addressLine1"
                          value={formData.addressLine1}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                          placeholder="Street address, building number"
                          autoFocus
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 2</label>
                        <input 
                          type="text" 
                          name="addressLine2"
                          value={formData.addressLine2}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                          placeholder="Suite, Floor, Landmark (Optional)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">State / Province <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Country <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Registration & Branding */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" /> Registration & Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Registration */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Registration Number</label>
                        <input 
                          type="text" 
                          name="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                          placeholder="e.g. REG-2023-XX"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax Number (GST/VAT)</label>
                        <input 
                          type="text" 
                          name="taxNumber"
                          value={formData.taxNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">License Number</label>
                        <input 
                          type="text" 
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Accreditation</label>
                        <select 
                          name="accreditation"
                          value={formData.accreditation}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        >
                          <option value="None">None</option>
                          <option value="NABH">NABH</option>
                          <option value="JCI">JCI</option>
                          <option value="ISO">ISO</option>
                        </select>
                      </div>

                      <hr className="md:col-span-2 border-gray-100 my-2" />
                      
                      {/* Logo Upload Section */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Hospital Logo</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 transition-colors bg-gray-50">
                          <div className="space-y-1 text-center w-full">
                            {logoPreview ? (
                              <div className="flex flex-col items-center">
                                <div className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm mb-4 inline-block">
                                  <img src={logoPreview} alt="Logo preview" className="h-32 w-auto min-w-[128px] object-contain bg-white p-2" />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <label className="cursor-pointer p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors shadow-sm" title="Replace Image">
                                      <Edit2 className="w-4 h-4" />
                                      <input type="file" className="sr-only" accept="image/png, image/jpeg, image/webp, image/svg+xml" onChange={handleFileChange} />
                                    </label>
                                    <button type="button" onClick={removeLogo} className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors shadow-sm" title="Remove Image">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600 flex items-center justify-center gap-2">
                                  <Check className="w-4 h-4 text-green-500" /> Image selected successfully
                                </div>
                              </div>
                            ) : (
                              <>
                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex flex-col text-sm text-gray-600 items-center mt-4">
                                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-3 py-1.5 border border-blue-600 bg-white">
                                    <span>Browse Files</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp, image/svg+xml" onChange={handleFileChange} />
                                  </label>
                                  <p className="mt-2 text-gray-500">or drag and drop here</p>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">PNG, JPG, SVG, WebP up to 5MB</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <hr className="md:col-span-2 border-gray-100 my-2" />

                      {/* Branding & Settings */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Website URL</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            type="url" 
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                            placeholder="https://www.hospital.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
                        <input 
                          type="text" 
                          name="timezone"
                          value={formData.timezone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                          placeholder="Asia/Kolkata"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                        <input 
                          type="text" 
                          name="currency"
                          value={formData.currency}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                          placeholder="INR, USD, etc."
                        />
                      </div>

                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer / Wizard Controls */}
            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                {currentStep > 1 ? (
                  <button 
                    type="button"
                    onClick={handleBack}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Back
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
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
                    className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Creating...</>
                    ) : (
                      <><Check className="w-4 h-4" /> Complete Registration</>
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