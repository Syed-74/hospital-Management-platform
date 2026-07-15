import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../core/context/AuthContext";
import { 
  Plus, Search, Edit2, Trash2, Shield, ToggleLeft, ToggleRight, 
  MapPin, Phone, Mail, Building2, Globe, Clock, CheckCircle2, 
  AlertCircle, X, Check, Loader2, Landmark, Copy, Download, ExternalLink
} from "lucide-react";
import Button from "../../core/components/ui/Button";
import Input from "../../core/components/ui/Input";

export default function ManageBranch() {
  const { 
    user, 
    getAllBranches, 
    createBranch, 
    updateBranch, 
    deleteBranch 
  } = useAuth();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, ACTIVE, INACTIVE, MAIN
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBranchId, setCurrentBranchId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Autocomplete ref
  const searchInputRef = useRef(null);

  // Form Fields
  const [formData, setFormData] = useState({
    branchName: "",
    branchCode: "",
    isMainBranch: false,
    email: "",
    phone: "",
    alternatePhone: "",
    addressLine1: "",
    addressLine2: "",
    country: "India",
    state: "Telangana",
    city: "Hyderabad",
    postalCode: "",
    timezone: "Asia/Kolkata",
    currency: "INR",
    licenseNumber: "",
    isActive: true
  });

  const hospitalId = user?.hospitalId;

  // Load Google Maps API Script
  useEffect(() => {
    if (window.google) return;
    
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // Initialize Autocomplete when Modal Opens
  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => {
        initAutocomplete();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  const initAutocomplete = () => {
    if (!searchInputRef.current || !window.google) return;

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        types: ["address"]
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.address_components) return;

        let address1 = "";
        let address2 = "";
        let city = "";
        let state = "";
        let country = "";
        let postalCode = "";

        place.address_components.forEach((component) => {
          const types = component.types;
          if (types.includes("street_number")) {
            address1 = component.long_name + " " + address1;
          }
          if (types.includes("route")) {
            address1 += component.long_name;
          }
          if (types.includes("sublocality_level_1") || types.includes("neighborhood")) {
            address2 = component.long_name;
          }
          if (types.includes("locality") || types.includes("postal_town")) {
            city = component.long_name;
          }
          if (types.includes("administrative_area_level_1")) {
            state = component.long_name;
          }
          if (types.includes("country")) {
            country = component.long_name;
          }
          if (types.includes("postal_code")) {
            postalCode = component.long_name;
          }
        });

        setFormData((prev) => ({
          ...prev,
          addressLine1: address1.trim() || prev.addressLine1,
          addressLine2: address2.trim() || prev.addressLine2,
          city: city || prev.city,
          state: state || prev.state,
          country: country || prev.country,
          postalCode: postalCode || prev.postalCode
        }));
      });
    } catch (e) {
      console.warn("Google Maps Places library load failed or key is invalid:", e);
    }
  };

  useEffect(() => {
    if (hospitalId) {
      fetchBranches();
    } else {
      setLoading(false);
      setError("No associated hospital found for your account.");
    }
  }, [hospitalId]);

  const fetchBranches = async () => {
    setLoading(true);
    setError("");
    const result = await getAllBranches(hospitalId);
    if (result.success) {
      setBranches(result.data || []);
    } else {
      setError(result.message || "Failed to retrieve branches.");
    }
    setLoading(false);
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
    setCurrentBranchId(null);
    setFormData({
      branchName: "",
      branchCode: "",
      isMainBranch: false,
      email: "",
      phone: "",
      alternatePhone: "",
      addressLine1: "",
      addressLine2: "",
      country: "India",
      state: "Telangana",
      city: "Hyderabad",
      postalCode: "",
      timezone: "Asia/Kolkata",
      currency: "INR",
      licenseNumber: "",
      isActive: true
    });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (branch) => {
    setIsEditing(true);
    setCurrentBranchId(branch.id);
    setFormData({
      branchName: branch.branchName || "",
      branchCode: branch.branchCode || "",
      isMainBranch: branch.isMainBranch || false,
      email: branch.email || "",
      phone: branch.phone || "",
      alternatePhone: branch.alternatePhone || "",
      addressLine1: branch.addressLine1 || "",
      addressLine2: branch.addressLine2 || "",
      country: branch.country || "",
      state: branch.state || "",
      city: branch.city || "",
      postalCode: branch.postalCode || "",
      timezone: branch.timezone || "Asia/Kolkata",
      currency: branch.currency || "INR",
      licenseNumber: branch.licenseNumber || "",
      isActive: branch.isActive !== undefined ? branch.isActive : true
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccess("");

    let result;
    if (isEditing) {
      result = await updateBranch(currentBranchId, formData);
    } else {
      result = await createBranch(hospitalId, formData);
    }

    if (result.success) {
      setSuccess(`Branch successfully ${isEditing ? "updated" : "created"}!`);
      setIsModalOpen(false);
      fetchBranches();
      setTimeout(() => setSuccess(""), 4000);
    } else {
      setError(result.message || "Operation failed. Please try again.");
    }
    setFormLoading(false);
  };

  const handleDelete = async (branchId) => {
    if (!window.confirm("Are you sure you want to delete this branch? This action cannot be undone.")) {
      return;
    }
    
    setError("");
    setSuccess("");
    const result = await deleteBranch(branchId);
    if (result.success) {
      setSuccess("Branch successfully deleted.");
      fetchBranches();
      setTimeout(() => setSuccess(""), 4000);
    } else {
      setError(result.message || "Failed to delete branch.");
    }
  };

  const handleToggleStatus = async (branch) => {
    const updatedStatus = !branch.isActive;
    const result = await updateBranch(branch.id, { ...branch, isActive: updatedStatus });
    if (result.success) {
      setSuccess(`Branch status set to ${updatedStatus ? "Active" : "Inactive"}.`);
      fetchBranches();
      setTimeout(() => setSuccess(""), 4000);
    } else {
      setError(result.message || "Failed to update branch status.");
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setSuccess(`${type} copied to clipboard!`);
    setTimeout(() => setSuccess(""), 2500);
  };

  const exportToCSV = () => {
    const headers = ["Branch Name", "Branch Code", "Email", "Phone", "Address Line 1", "City", "State", "Country", "Postal Code", "Status"];
    const rows = filteredBranches.map(b => [
      `"${b.branchName.replace(/"/g, '""')}"`,
      b.branchCode,
      b.email,
      b.phone,
      `"${b.addressLine1.replace(/"/g, '""')}"`,
      b.city,
      b.state,
      b.country,
      b.postalCode,
      b.isActive ? "Active" : "Inactive"
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `branches_${hospitalId}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBranches = branches.filter((branch) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = (
      branch.branchName?.toLowerCase().includes(query) ||
      branch.branchCode?.toLowerCase().includes(query) ||
      branch.city?.toLowerCase().includes(query) ||
      branch.email?.toLowerCase().includes(query)
    );

    if (!matchesSearch) return false;

    if (statusFilter === "ACTIVE") return branch.isActive;
    if (statusFilter === "INACTIVE") return !branch.isActive;
    if (statusFilter === "MAIN") return branch.isMainBranch;

    return true;
  });

  const totalBranches = branches.length;
  const activeBranches = branches.filter(b => b.isActive).length;
  const mainBranches = branches.filter(b => b.isMainBranch).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Manage Branches</h1>
          <p className="text-sm text-slate-500 mt-1">Configure, monitor, and update branch offices under your hospital network.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={exportToCSV}
            disabled={filteredBranches.length === 0}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl py-2.5 px-4 font-semibold transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-4 font-semibold shadow-md shadow-blue-500/10 transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Add New Branch
          </Button>
        </div>
      </div>

      {/* Alert Notifications */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Branches</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalBranches}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Locations</p>
            <p className="text-2xl font-bold text-green-600 mt-0.5">{activeBranches}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Headquarters</p>
            <p className="text-2xl font-bold text-indigo-600 mt-0.5">{mainBranches}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inactive/Suspended</p>
            <p className="text-2xl font-bold text-slate-600 mt-0.5">{totalBranches - activeBranches}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by branch name, code, city, email..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all duration-150"
          />
        </div>
        
        {/* Status Filters */}
        <div className="flex p-1 bg-slate-100 rounded-xl space-x-1 self-start md:self-auto">
          {["ALL", "ACTIVE", "INACTIVE", "MAIN"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                statusFilter === filter 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading branch records...</p>
        </div>
      ) : filteredBranches.length === 0 ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50">
          <Building2 className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No branches found</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            No branch records match your criteria. Try adjusting your filters or add a new branch to the network.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Branch Details</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role/Status</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBranches.map((branch) => (
                    <tr key={branch.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${branch.isMainBranch ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'}`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{branch.branchName}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-slate-400 font-mono tracking-wider">{branch.branchCode}</span>
                              <button 
                                onClick={() => copyToClipboard(branch.branchCode, "Branch code")}
                                title="Copy code"
                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-all"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-slate-600 gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{branch.email}</span>
                          </div>
                          <div className="flex items-center text-xs text-slate-600 gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{branch.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1 max-w-[200px]">
                          <div className="flex items-start text-xs text-slate-600 gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{branch.addressLine1}, {branch.city}, {branch.state}, {branch.country}</span>
                          </div>
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${branch.branchName} ${branch.addressLine1} ${branch.city} ${branch.state} ${branch.country}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-[10px] text-blue-600 font-bold hover:underline gap-0.5"
                          >
                            <span>View on Map</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          {branch.isMainBranch && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              HQ / Main
                            </span>
                          )}
                          <button 
                            onClick={() => handleToggleStatus(branch)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                              branch.isActive 
                                ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
                                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${branch.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {branch.isActive ? "Active" : "Inactive"}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button 
                            onClick={() => openEditModal(branch)}
                            title="Edit Branch"
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(branch.id)}
                            title="Delete Branch"
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
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
          </div>

          {/* Mobile Grid/Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredBranches.map((branch) => (
              <div key={branch.id} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${branch.isMainBranch ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'}`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{branch.branchName}</h4>
                      <p className="text-xs text-slate-400 font-mono">{branch.branchCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => openEditModal(branch)}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(branch.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-50 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{branch.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{branch.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{branch.addressLine1}, {branch.city}, {branch.state}, {branch.country}</span>
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${branch.branchName} ${branch.addressLine1} ${branch.city} ${branch.state} ${branch.country}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-blue-600 font-bold hover:underline gap-1 mt-1"
                  >
                    <span>View on Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    {branch.isMainBranch && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Main Branch
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleToggleStatus(branch)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                      branch.isActive 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${branch.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {branch.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Slide-over Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-lg h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{isEditing ? "Update Branch Details" : "Register New Branch"}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Please provide configuration details for this specific site.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">General Information</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-600">Branch Name *</label>
                    <Input 
                      type="text" 
                      name="branchName" 
                      required
                      value={formData.branchName}
                      onChange={handleInputChange}
                      placeholder="e.g. Apollo Jubilee Hills"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Branch Code *</label>
                    <Input 
                      type="text" 
                      name="branchCode" 
                      required
                      disabled={isEditing}
                      value={formData.branchCode}
                      onChange={handleInputChange}
                      placeholder="e.g. APOLLO-JH-01"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">License Number</label>
                    <Input 
                      type="text" 
                      name="licenseNumber" 
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      placeholder="Lic. No / Reg No"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6 pt-2">
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      name="isMainBranch"
                      checked={formData.isMainBranch}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20"
                    />
                    <span className="text-sm font-semibold text-slate-700">Set as Main Headquarters Branch</span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20"
                    />
                    <span className="text-sm font-semibold text-slate-700">Is Active</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Contact Credentials</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-600">Official Email *</label>
                    <Input 
                      type="email" 
                      name="email" 
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="info@branch.apollo.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Contact Number *</label>
                    <Input 
                      type="tel" 
                      name="phone" 
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Alternate Phone</label>
                    <Input 
                      type="tel" 
                      name="alternatePhone" 
                      value={formData.alternatePhone}
                      onChange={handleInputChange}
                      placeholder="Optional phone"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Address Details</h4>
                
                <div className="space-y-4">
                  
                  {/* Google Autocomplete search input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-blue-600">Search Address (Google Auto-fill)</label>
                    <input 
                      type="text" 
                      ref={searchInputRef}
                      placeholder="Type a location to auto-populate fields..."
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-blue-50/20 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Address Line 1 *</label>
                    <Input 
                      type="text" 
                      name="addressLine1" 
                      required
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      placeholder="Building, street address"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Address Line 2</label>
                    <Input 
                      type="text" 
                      name="addressLine2" 
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      placeholder="Apartment, suite, unit, etc."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">City *</label>
                      <Input 
                        type="text" 
                        name="city" 
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Hyderabad"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">State *</label>
                      <Input 
                        type="text" 
                        name="state" 
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="e.g. Telangana"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Postal Code *</label>
                      <Input 
                        type="text" 
                        name="postalCode" 
                        required
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="e.g. 500033"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Country *</label>
                      <Input 
                        type="text" 
                        name="country" 
                        required
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="e.g. India"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Localization</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Timezone</label>
                    <Input 
                      type="text" 
                      name="timezone" 
                      value={formData.timezone}
                      onChange={handleInputChange}
                      placeholder="e.g. Asia/Kolkata"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Currency</label>
                    <Input 
                      type="text" 
                      name="currency" 
                      value={formData.currency}
                      onChange={handleInputChange}
                      placeholder="e.g. INR"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs font-medium text-red-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
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
                onClick={handleFormSubmit}
                isLoading={formLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 font-semibold text-sm shadow-md shadow-blue-500/10 transition-all flex items-center justify-center border-none"
              >
                {isEditing ? "Save Changes" : "Register Branch"}
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}