import React, { useState, useEffect } from 'react';
import axios from '../../core/api/axios';
import { 
  Plus, Search, Edit2, Trash2, X, AlertCircle, Building2, User, Mail, Phone, BadgeInfo 
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
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  
  // Edit State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    hospitalId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    employeeCode: '',
    roleId: '',
    isActive: true,
    status: 'PENDING'
  });

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
        axios.get('/roles?scope=TENANT')
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
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditId(null);
    setFormData({
      hospitalId: '', firstName: '', lastName: '', email: '', password: '', phone: '', employeeCode: '', roleId: '', isActive: true, status: 'PENDING'
    });
    setError('');
    setStep(1);
    setIsModalOpen(true);
  };

  const openEditModal = (admin) => {
    setIsEditMode(true);
    setEditId(admin.id);
    
    // Find the role ID from the admin's roles array if it exists
    const roleId = admin.roles && admin.roles.length > 0 ? admin.roles[0].id : '';

    setFormData({
      hospitalId: admin.hospitalId || '',
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      email: admin.email || '',
      password: '', // Leave empty on edit
      phone: admin.hospitalAdmin?.phone || '',
      employeeCode: admin.hospitalAdmin?.employeeCode || '',
      roleId: roleId,
      isActive: admin.isActive,
      status: admin.hospitalAdmin?.status || 'PENDING'
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Hospital Admins</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            Create, update, and manage hospital administrators and their dynamic role assignments.
          </p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Admin
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl flex items-start border border-red-100 shadow-sm">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Admin List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hospital & Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No hospital administrators found. Create one to get started.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {admin.firstName?.charAt(0) || ''}{admin.lastName?.charAt(0) || ''}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{admin.firstName} {admin.lastName}</div>
                          <div className="text-xs text-gray-500">ID: {admin.hospitalAdmin?.employeeCode || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{admin.email}</div>
                      <div className="text-sm text-gray-500">{admin.hospitalAdmin?.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col text-sm text-gray-900">
                        <div className="flex items-center font-medium">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          {admin.hospital?.hospitalName || 'Unassigned'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 pl-6">
                          Role: {admin.roles && admin.roles.length > 0 ? admin.roles[0].name : 'None'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-gray-400">
                          {admin.hospitalAdmin?.status || 'PENDING'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEditModal(admin)} className="text-indigo-600 hover:text-indigo-900 transition-colors p-2 rounded-lg hover:bg-indigo-50 mr-2">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(admin.id)} className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            
            <div className="relative inline-block w-full max-w-2xl p-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl sm:my-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Hospital Admin' : 'Create Hospital Admin'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {step === 1 
                      ? (isEditMode ? 'Update administrator details and hospital assignment.' : 'Step 1: Enter basic details and assign to a hospital.')
                      : 'Step 2: Assign roles and review permissions.'
                    }
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-xl flex items-start border border-red-100 shadow-sm">
                  <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* STEP 1: Basic Info */}
                {step === 1 && (
                  <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">First Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none" placeholder="John" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Last Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none" placeholder="Doe" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Email Address <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input required={!isEditMode} disabled={isEditMode} type="email" name="email" value={formData.email} onChange={handleInputChange}
                            className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl transition-all outline-none ${isEditMode ? 'bg-gray-100 text-gray-500' : 'bg-gray-50 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600'}`} placeholder="admin@hospital.com" />
                        </div>
                      </div>

                      {!isEditMode && (
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-900">Temporary Password <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <input required type="password" name="password" value={formData.password} onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none" placeholder="••••••••" />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Phone Number <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none" placeholder="+1 (555) 000-0000" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Employee Code</label>
                        <div className="relative">
                          <BadgeInfo className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input type="text" name="employeeCode" value={formData.employeeCode} onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none" placeholder="EMP-12345" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-sm font-semibold text-gray-900">Assign to Hospital <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select required name="hospitalId" value={formData.hospitalId} onChange={handleInputChange} disabled={isEditMode}
                          className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl transition-all outline-none appearance-none ${isEditMode ? 'bg-gray-100 text-gray-500' : 'bg-gray-50 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600'}`}>
                          <option value="">Select a Hospital</option>
                          {hospitals.map(h => (
                            <option key={h.id} value={h.id}>{h.hospitalName} ({h.hospitalCode})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {isEditMode && (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-2">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-900">Account Status</label>
                          <select name="status" value={formData.status} onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none appearance-none">
                            <option value="PENDING">Pending</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="SUSPENDED">Suspended</option>
                          </select>
                        </div>

                        <div className="flex items-center space-x-3 pt-8">
                          <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleInputChange}
                            className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-600" />
                          <label htmlFor="isActive" className="text-sm font-semibold text-gray-900">User is Login Active</label>
                        </div>
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                      <button type="button" onClick={() => setIsModalOpen(false)}
                        className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                      <button type="button" onClick={handleNextStep}
                        className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm active:scale-95 transition-all">
                        Next: Assign Role
                      </button>
                    </div>
                  </>
                )}

                {/* STEP 2: Roles and Permissions */}
                {step === 2 && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">Assign Role <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select required name="roleId" value={formData.roleId} onChange={handleInputChange} disabled={isEditMode}
                          className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl transition-all outline-none appearance-none ${isEditMode ? 'bg-gray-100 text-gray-500' : 'bg-gray-50 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600'}`}>
                          <option value="">Select a Role</option>
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name} {r.description ? `(${r.description})` : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {formData.roleId && (
                      <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                          <h4 className="text-sm font-bold text-gray-800">Granted Permissions Review</h4>
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                            Read-Only
                          </span>
                        </div>
                        <div className="max-h-60 overflow-y-auto p-4 bg-white">
                          {roles.find(r => r.id === formData.roleId)?.permissions?.length > 0 ? (
                            <ul className="space-y-3">
                              {roles.find(r => r.id === formData.roleId).permissions.map(p => (
                                <li key={p.id} className="flex items-start">
                                  <div className="flex-shrink-0 h-5 w-5 rounded bg-green-100 text-green-600 flex items-center justify-center mr-3 mt-0.5">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{p.action}</p>
                                    {p.description && <p className="text-xs text-gray-500">{p.description}</p>}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No specific permissions attached to this role.</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between">
                      <button type="button" onClick={() => setStep(1)}
                        className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
                        Back
                      </button>
                      <button type="submit"
                        className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm active:scale-95 transition-all">
                        {isEditMode ? 'Save Changes' : 'Create Administrator'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}