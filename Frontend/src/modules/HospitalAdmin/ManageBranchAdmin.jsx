import React, { useState, useEffect } from "react";
import { useAuth } from "../../core/context/AuthContext";
import { 
  Plus, Search, Edit2, Trash2, Loader2, Shield, AlertCircle, ChevronRight, ChevronLeft, X, UserPlus, CheckCircle2
} from "lucide-react";
import Button from "../../core/components/ui/Button";
import Input from "../../core/components/ui/Input";

export default function ManageBranchAdmin() {
  const { 
    user, 
    getAllBranchAdmins, 
    createBranchAdmin, 
    updateBranchAdmin, 
    deleteBranchAdmin,
    getAllBranches,
    getAllRoles
  } = useAuth();

  const [branchAdmins, setBranchAdmins] = useState([]);
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const hospitalId = user?.hospitalId;

  const defaultFormData = {
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    alternatePhoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    branchId: "",
    employeeId: "",
    departmentId: "",
    designation: "",
    roleId: "",
    password: "",
    twoFactorEnabled: false,
    hospitalId: hospitalId || ""
  };

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (hospitalId) {
      fetchBranchAdmins();
      fetchBranches();
      fetchRoles();
    } else {
      setLoading(false);
      setError("No associated hospital found for your account.");
    }
  }, [hospitalId]);

  const fetchRoles = async () => {
    const result = await getAllRoles("BRANCH"); 
    if (result.success) {
      setRoles(result.data || []);
    }
  };

  const fetchBranchAdmins = async () => {
    setLoading(true);
    setError("");
    const result = await getAllBranchAdmins(hospitalId);
    if (result.success) {
      setBranchAdmins(result.data || []);
    } else {
      setError(result.message || "Failed to retrieve branch admins.");
    }
    setLoading(false);
  };

  const fetchBranches = async () => {
    const result = await getAllBranches(hospitalId);
    if (result.success) {
      setBranches(result.data || []);
      if (result.data?.length > 0 && !formData.branchId) {
        setFormData(prev => ({ ...prev, branchId: result.data[0].id }));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentAdminId(null);
    setCurrentStep(1);
    setFormData({
      ...defaultFormData,
      branchId: branches.length > 0 ? branches[0].id : "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (admin) => {
    setIsEditing(true);
    setCurrentAdminId(admin.id);
    setCurrentStep(1);
    setFormData({
      firstName: admin.firstName || admin.user?.firstName || "",
      middleName: admin.middleName || "",
      lastName: admin.lastName || admin.user?.lastName || "",
      dateOfBirth: admin.dateOfBirth ? admin.dateOfBirth.split("T")[0] : "",
      gender: admin.gender || "",
      email: admin.email || admin.user?.email || "",
      phone: admin.phoneNumber || "",
      alternatePhoneNumber: admin.alternatePhoneNumber || "",
      addressLine1: admin.addressLine1 || "",
      addressLine2: admin.addressLine2 || "",
      city: admin.city || "",
      state: admin.state || "",
      country: admin.country || "",
      postalCode: admin.postalCode || "",
      branchId: admin.branchId || "",
      employeeId: admin.employeeId || "",
      departmentId: admin.departmentId || "",
      designation: admin.designation || "",
      roleId: admin.roleId || "",
      password: "", // Keep empty for edit unless they want to change
      twoFactorEnabled: admin.twoFactorEnabled || false,
      hospitalId: admin.hospitalId || hospitalId
    });
    setError("");
    setIsModalOpen(true);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.firstName.trim()) return "First Name is required.";
        if (!formData.lastName.trim()) return "Last Name is required.";
        return null;
      case 2:
        if (!formData.email.trim()) return "Email is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Invalid email format.";
        if (!formData.phone.trim()) return "Primary Phone is required.";
        return null;
      case 3:
        if (!formData.branchId) return "Assign Branch is required.";
        return null;
      case 4:
        if (!isEditing && !formData.password) return "Password is required for new Branch Admins.";
        if (formData.password && formData.password.length < 6) return "Password must be at least 6 characters.";
        return null;
      default:
        return null;
    }
  };

  const nextStep = () => {
    const errorMsg = validateStep(currentStep);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    setError("");
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setError("");
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const errorMsg = validateStep(currentStep);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setFormLoading(true);
    setError("");
    setSuccess("");

    // Prepare data payload
    const payload = { ...formData };
    if (isEditing && !payload.password) {
      delete payload.password; // Don't send empty password on update
    }

    let result;
    if (isEditing) {
      result = await updateBranchAdmin(currentAdminId, payload);
    } else {
      result = await createBranchAdmin(payload);
    }

    if (result.success) {
      setSuccess(`Branch Admin successfully ${isEditing ? "updated" : "created"}!`);
      setIsModalOpen(false);
      fetchBranchAdmins();
      setTimeout(() => setSuccess(""), 4000);
    } else {
      setError(result.message || "Operation failed. Please try again.");
    }
    setFormLoading(false);
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this branch admin?")) {
      return;
    }
    
    setError("");
    setSuccess("");
    const result = await deleteBranchAdmin(adminId);
    if (result.success) {
      setSuccess("Branch Admin successfully deleted.");
      fetchBranchAdmins();
      setTimeout(() => setSuccess(""), 4000);
    } else {
      setError(result.message || "Failed to delete branch admin.");
    }
  };

  const filteredAdmins = branchAdmins.filter(admin => 
    (admin.firstName || admin.user?.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (admin.lastName || admin.user?.lastName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (admin.email || admin.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Branch Admins</h1>
          <p className="text-gray-600 mt-1">Add, update, or remove branch administrators.</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus size={18} /> Add Branch Admin
        </Button>
      </div>

      {error && !isModalOpen && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md flex items-center gap-2">
          <Shield size={20} />
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search admins..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-sm">
                  <th className="p-4 font-semibold border-b">Name</th>
                  <th className="p-4 font-semibold border-b">Email</th>
                  <th className="p-4 font-semibold border-b">Phone</th>
                  <th className="p-4 font-semibold border-b text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      No branch admins found.
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        {admin.firstName || admin.user?.firstName} {admin.lastName || admin.user?.lastName}
                      </td>
                      <td className="p-4">{admin.email || admin.user?.email}</td>
                      <td className="p-4">{admin.phoneNumber}</td>
                      <td className="p-4 flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(admin)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(admin.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity p-4 sm:p-6 duration-300">
          <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 ease-out overflow-hidden">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-teal-600" />
                  {isEditing ? "Update Branch Admin" : "Register Branch Admin"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Step {currentStep} of {totalSteps} — {currentStep === 1 ? 'Personal Info' : currentStep === 2 ? 'Contact Details' : currentStep === 3 ? 'Organization' : 'Security'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Stepper Progress Bar */}
            <div className="h-1 w-full bg-slate-100">
              <div 
                className="h-full bg-teal-600 transition-all duration-300 ease-out" 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 relative">
              {error && (
                <div className="mb-6 p-3.5 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2 text-sm font-medium animate-in fade-in">
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </div>
              )}
              
              <form id="adminForm" onSubmit={handleFormSubmit} className="space-y-6 animate-in fade-in duration-300">
                
                {/* STEP 1: Personal Info */}
                {currentStep === 1 && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-teal-700 uppercase tracking-wider mb-2">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">First Name <span className="text-red-500">*</span></label>
                        <Input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Middle Name</label>
                        <Input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Last Name <span className="text-red-500">*</span></label>
                        <Input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Date of Birth</label>
                        <Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500" />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white">
                          <option value="">Select...</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Contact & Address */}
                {currentStep === 2 && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-teal-700 uppercase tracking-wider mb-2">Contact & Address</h3>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Email <span className="text-red-500">*</span></label>
                        <Input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Primary Phone <span className="text-red-500">*</span></label>
                        <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Alternate Phone</label>
                        <Input type="tel" name="alternatePhoneNumber" value={formData.alternatePhoneNumber} onChange={handleInputChange} className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500" />
                      </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Address Location</label>
                      <Input type="text" placeholder="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500" />
                      <Input type="text" placeholder="Address Line 2 (Optional)" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500" />
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <Input type="text" placeholder="City" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500" />
                        <Input type="text" placeholder="State" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500" />
                        <Input type="text" placeholder="Country" name="country" value={formData.country} onChange={handleInputChange} className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500" />
                        <Input type="text" placeholder="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500" />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Organization Details */}
                {currentStep === 3 && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-teal-700 uppercase tracking-wider mb-2">Organization Configuration</h3>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Assign Branch <span className="text-red-500">*</span></label>
                        <select name="branchId" value={formData.branchId} onChange={handleInputChange} className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white">
                          <option value="">Select a Branch...</option>
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.branchName}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Assign Role</label>
                        <select 
                          name="roleId" 
                          value={formData.roleId} 
                          onChange={handleInputChange} 
                          className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                        >
                          <option value="">Select a Role...</option>
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5 mt-2">
                        <label className="block text-xs font-bold text-slate-700">Employee ID</label>
                        <Input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500" />
                      </div>
                      <div className="space-y-1.5 mt-2">
                        <label className="block text-xs font-bold text-slate-700">Department ID</label>
                        <Input type="text" name="departmentId" value={formData.departmentId} onChange={handleInputChange} className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500" />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Designation</label>
                        <Input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500" />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Security */}
                {currentStep === 4 && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-teal-700 uppercase tracking-wider mb-2">Security & Access</h3>
                    <div className="grid grid-cols-1 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Account Password {isEditing && <span className="text-slate-400 font-normal ml-1">(Leave blank to keep current)</span>}
                        </label>
                        <Input 
                          type="password" 
                          name="password" 
                          value={formData.password} 
                          onChange={handleInputChange} 
                          minLength={6}
                          className="w-full px-3.5 py-2.5 border-slate-200 rounded-lg text-sm focus:ring-teal-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center mt-6 pt-4 border-t border-slate-100">
                      <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          name="twoFactorEnabled"
                          checked={formData.twoFactorEnabled}
                          onChange={handleInputChange}
                          className="w-4.5 h-4.5 rounded text-teal-600 focus:ring-teal-500/20"
                        />
                        <span className="text-sm font-bold text-slate-700">Enable Two-Factor Authentication (2FA)</span>
                      </label>
                    </div>
                  </div>
                )}
              </form>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50 mt-auto">
              <Button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </Button>
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <Button 
                    type="button" 
                    onClick={prevStep} 
                    className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft size={16} /> Back
                  </Button>
                )}
                {currentStep < totalSteps ? (
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-1 border-none"
                  >
                    Next <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    form="adminForm" 
                    disabled={formLoading} 
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-2 border-none"
                  >
                    {formLoading && <Loader2 size={16} className="animate-spin" />}
                    {isEditing ? "Save Changes" : "Complete Registration"}
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}