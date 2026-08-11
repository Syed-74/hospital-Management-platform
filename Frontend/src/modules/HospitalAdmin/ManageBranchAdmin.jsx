import React, { useState, useEffect } from "react";
import { useAuth } from "../../core/context/AuthContext";
import { 
  Plus, Search, Edit2, Trash2, Loader2, Shield, AlertCircle, ChevronRight, ChevronLeft
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {isEditing ? "Edit Branch Admin" : "Add Branch Admin"}
              </h2>
              <div className="text-sm font-medium text-gray-500">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}
              
              <form id="adminForm" onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* STEP 1: Personal Info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <Input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                        <Input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <Input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Contact & Address</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <Input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone *</label>
                        <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                        <Input type="tel" name="alternatePhoneNumber" value={formData.alternatePhoneNumber} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="space-y-3 pt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <Input type="text" placeholder="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} />
                      <Input type="text" placeholder="Address Line 2" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} />
                      <div className="grid grid-cols-2 gap-4">
                        <Input type="text" placeholder="City" name="city" value={formData.city} onChange={handleInputChange} />
                        <Input type="text" placeholder="State" name="state" value={formData.state} onChange={handleInputChange} />
                        <Input type="text" placeholder="Country" name="country" value={formData.country} onChange={handleInputChange} />
                        <Input type="text" placeholder="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleInputChange} />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Organization Details */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Organization Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign Branch *</label>
                        <select name="branchId" value={formData.branchId} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Select a Branch...</option>
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.branchName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                        <Input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department ID</label>
                        <Input type="text" name="departmentId" value={formData.departmentId} onChange={handleInputChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                        <Input type="text" name="designation" value={formData.designation} onChange={handleInputChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign Role</label>
                        <select 
                          name="roleId" 
                          value={formData.roleId} 
                          onChange={handleInputChange} 
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a Role...</option>
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Security */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Security</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password * {isEditing && <span className="text-xs text-gray-500 font-normal">(Leave blank to keep current)</span>}
                        </label>
                        <Input 
                          type="password" 
                          name="password" 
                          value={formData.password} 
                          onChange={handleInputChange} 
                          minLength={6}
                        />
                      </div>
                    </div>
                    <div className="flex items-center mt-4">
                      <input 
                        type="checkbox" 
                        id="twoFactorEnabled"
                        name="twoFactorEnabled"
                        checked={formData.twoFactorEnabled}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="twoFactorEnabled" className="ml-2 block text-sm text-gray-900">
                        Enable Two-Factor Authentication (2FA)
                      </label>
                    </div>
                  </div>
                )}
              </form>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-between items-center bg-gray-50 rounded-b-lg">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <Button type="button" variant="secondary" onClick={prevStep} className="flex items-center gap-1">
                    <ChevronLeft size={16} /> Previous
                  </Button>
                )}
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep} className="flex items-center gap-1">
                    Next <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button type="submit" form="adminForm" disabled={formLoading} className="flex items-center gap-2">
                    {formLoading && <Loader2 size={16} className="animate-spin" />}
                    {isEditing ? "Update Admin" : "Create Admin"}
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