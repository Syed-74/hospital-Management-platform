import React, { useState, useEffect } from "react";
import { useAuth } from "../../core/context/AuthContext";
import { 
  Plus, Search, Edit2, Trash2, Building2, 
  MapPin, Phone, AlertCircle, CheckCircle, XCircle 
} from "lucide-react";
import Button from "../../core/components/ui/Button";
import Input from "../../core/components/ui/Input";

export default function ManageDepartments() {
  const { 
    user, 
    getallDepartment, 
    createDepartment, 
    updateDepartment, 
    deleteDepartment 
  } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form State
  const defaultFormData = {
    departmentName: "",
    departmentCode: "",
    departmentType: "",
    description: "",
    location: "",
    headOfDepartment: "",
    contactNumber: "",
    isActive: true,
    emergencyAvailable: false
  };
  
  const [formData, setFormData] = useState(defaultFormData);

  // Fetch Data
  const fetchDepartments = async () => {
    setLoading(true);
    setError("");
    // Note: Assuming getallDepartment fetches for the current branch/tenant via backend token parsing
    const result = await getallDepartment();
    if (result.success) {
      setDepartments(result.data || []);
    } else {
      setError(result.message || "Failed to fetch departments.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openCreateModal = () => {
    setFormData({
      ...defaultFormData,
      // If we want to assign to current hospital/branch automatically on frontend, we could do it here
      // But typically it's better if backend handles tenant resolution via req.user token
    });
    setIsEditing(false);
    setCurrentId(null);
    setIsModalOpen(true);
    setError("");
    setSuccess("");
  };

  const openEditModal = (department) => {
    setFormData({
      departmentName: department.departmentName || "",
      departmentCode: department.departmentCode || "",
      departmentType: department.departmentType || "",
      description: department.description || "",
      location: department.location || "",
      headOfDepartment: department.headOfDepartment || "",
      contactNumber: department.contactNumber || "",
      isActive: department.isActive !== false,
      emergencyAvailable: department.emergencyAvailable === true
    });
    setIsEditing(true);
    setCurrentId(department.id);
    setIsModalOpen(true);
    setError("");
    setSuccess("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccess("");

    // Optional: inject hospitalId and branchId if backend requires them in body payload
    const payload = {
      ...formData,
      hospitalId: user?.hospitalId || user?.branchAdmin?.hospitalId,
      branchId: user?.branchAdmin?.branchId
    };

    let result;
    if (isEditing) {
      result = await updateDepartment(currentId, payload);
    } else {
      result = await createDepartment(payload);
    }

    setFormLoading(false);

    if (result.success) {
      setSuccess(`Department successfully ${isEditing ? 'updated' : 'created'}.`);
      setIsModalOpen(false);
      fetchDepartments();
      setTimeout(() => setSuccess(""), 4000);
    } else {
      setError(result.message || `Failed to ${isEditing ? 'update' : 'create'} department.`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    
    setError("");
    setSuccess("");
    const result = await deleteDepartment(id);
    if (result.success) {
      setSuccess("Department successfully deleted.");
      fetchDepartments();
      setTimeout(() => setSuccess(""), 4000);
    } else {
      setError(result.message || "Failed to delete department.");
    }
  };

  // Filter
  const filteredDepartments = departments.filter(d => 
    (d.departmentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.departmentCode || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="text-blue-600" /> Manage Departments
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure clinical and administrative departments for your branch.</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus size={18} /> Add Department
        </Button>
      </div>

      {/* Global Feedback */}
      {error && !isModalOpen && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 border border-red-100">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {success && !isModalOpen && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-2 border border-green-100">
          <CheckCircle size={18} /> {success}
        </div>
      )}

      {/* Tools: Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Search departments by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading departments...</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <Building2 size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium text-lg">No departments found</p>
            <p className="text-gray-400 mt-1">Get started by creating a new department.</p>
            <Button onClick={openCreateModal} className="mt-6 bg-blue-50 text-blue-600 hover:bg-blue-100">
              Create First Department
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type / Location</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Emergency</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
                          {dept.departmentCode?.substring(0, 2) || 'DP'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{dept.departmentName}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Code: <span className="font-medium text-gray-700">{dept.departmentCode}</span></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800 font-medium">{dept.departmentType || 'Unspecified'}</div>
                      {dept.location && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin size={12} /> {dept.location}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                        dept.isActive 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {dept.emergencyAvailable ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          24/7 Available
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(dept)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="Edit Department"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(dept.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Delete Department"
                        >
                          <Trash2 size={16} />
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="text-blue-600" size={20} />
                {isEditing ? "Edit Department" : "Add New Department"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} shrink={0} /> {error}
                </div>
              )}

              <form id="departmentForm" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department Name <span className="text-red-500">*</span></label>
                    <Input 
                      type="text" 
                      name="departmentName" 
                      required 
                      value={formData.departmentName} 
                      onChange={handleInputChange} 
                      placeholder="e.g., Cardiology"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department Code <span className="text-red-500">*</span></label>
                    <Input 
                      type="text" 
                      name="departmentCode" 
                      required 
                      value={formData.departmentCode} 
                      onChange={handleInputChange} 
                      placeholder="e.g., CARD-01"
                      className="uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department Type <span className="text-red-500">*</span></label>
                    <select 
                      name="departmentType" 
                      required
                      value={formData.departmentType} 
                      onChange={handleInputChange} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="">Select Type...</option>
                      <option value="Clinical">Clinical</option>
                      <option value="Non-Clinical">Non-Clinical</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Surgical">Surgical</option>
                      <option value="Diagnostic">Diagnostic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Number</label>
                    <Input 
                      type="text" 
                      name="contactNumber" 
                      value={formData.contactNumber} 
                      onChange={handleInputChange} 
                      placeholder="e.g., Ext 405 or Phone"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location / Floor</label>
                    <Input 
                      type="text" 
                      name="location" 
                      value={formData.location} 
                      onChange={handleInputChange} 
                      placeholder="e.g., Building A, 2nd Floor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Head of Department (Name)</label>
                    <Input 
                      type="text" 
                      name="headOfDepartment" 
                      value={formData.headOfDepartment} 
                      onChange={handleInputChange} 
                      placeholder="e.g., Dr. Jane Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    rows="3"
                    placeholder="Brief description of the department's role..."
                  />
                </div>

                <div className="flex gap-8 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <label className="flex items-center cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="isActive" 
                      checked={formData.isActive} 
                      onChange={handleInputChange} 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-2 text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">Active Department</span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="emergencyAvailable" 
                      checked={formData.emergencyAvailable} 
                      onChange={handleInputChange} 
                      className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500 cursor-pointer"
                    />
                    <span className="ml-2 text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">24/7 Emergency Available</span>
                  </label>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 shrink-0">
              <Button type="button" variant="outline" onClick={closeModal} className="px-5 border-gray-200 text-gray-700 hover:bg-white hover:text-gray-900">
                Cancel
              </Button>
              <Button type="submit" form="departmentForm" disabled={formLoading} className="px-5 bg-blue-600 hover:bg-blue-700 text-white min-w-[120px] shadow-sm">
                {formLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Department"}
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}