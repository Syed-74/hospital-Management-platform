import React, { useState, useEffect } from "react";
import { useAuth } from "../../core/context/AuthContext";
import { 
  Layers, 
  DoorOpen, 
  Bed, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  X, 
  Loader2, 
  Building2, 
  Phone, 
  User, 
  DollarSign, 
  Users, 
  Hash, 
  Filter,
  Check,
  RefreshCw
} from "lucide-react";
import Button from "../../core/components/ui/Button";
import Input from "../../core/components/ui/Input";

export default function ManageInfrastructure({ initialTab = "rooms" }) {
  const { 
    getAllFloors, 
    createFloor, 
    updateFloor, 
    deleteFloor,
    getAllRooms, 
    createRoom, 
    updateRoom, 
    deleteRoom,
    getAllWards, 
    createWard, 
    updateWard, 
    deleteWard
  } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab); // 'floors' | 'rooms' | 'wards'
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Data lists
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [wards, setWards] = useState([]);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    floorId: "",
    roomId: "",
    type: "General",
    capacity: 1,
    status: "Active",
    isAvailable: true
  });

  // Load all infrastructure data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [floorsRes, roomsRes, wardsRes] = await Promise.all([
        getAllFloors ? getAllFloors() : Promise.resolve({ success: false, data: [] }),
        getAllRooms ? getAllRooms() : Promise.resolve({ success: false, data: [] }),
        getAllWards ? getAllWards() : Promise.resolve({ success: false, data: [] })
      ]);

      if (floorsRes.success) setFloors(floorsRes.data || []);
      if (roomsRes.success) setRooms(roomsRes.data || []);
      if (wardsRes.success) setWards(wardsRes.data || []);
    } catch (err) {
      setError("Failed to load infrastructure data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Form Reset / Modal Open
  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        name: item.name || "",
        code: item.code || "",
        floorId: item.floorId || item.floor?.id || "",
        roomId: item.roomId || item.room?.id || "",
        type: item.type || (activeTab === "rooms" ? "Consultation Room" : activeTab === "wards" ? "General Ward" : "General"),
        capacity: item.capacity || 1,
        status: item.status || "Active",
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true
      });
    } else {
      setFormData({
        name: "",
        code: "",
        floorId: floors.length > 0 ? floors[0].id : "",
        roomId: "",
        type: activeTab === "floors" ? "Consultation" : activeTab === "rooms" ? "Consultation Room" : "General Ward",
        capacity: activeTab === "wards" ? 10 : 1,
        status: "Active",
        isAvailable: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (activeTab === "rooms" && !formData.floorId) {
      setError("Please select a floor for the room.");
      return;
    }
    if (activeTab === "wards" && !formData.floorId) {
      setError("Please select a floor for the ward.");
      return;
    }
    if (activeTab === "wards" && !formData.roomId) {
      setError("Please select an available room for the ward.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let res;
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        type: formData.type ? formData.type.trim() : "General",
        status: formData.status,
      };

      if (activeTab === "rooms") {
        payload.capacity = parseInt(formData.capacity, 10) || 1;
        payload.isAvailable = formData.isAvailable;
        payload.floorId = formData.floorId || undefined;
      } else if (activeTab === "wards") {
        payload.capacity = parseInt(formData.capacity, 10) || 1;
        payload.isAvailable = formData.isAvailable;
        payload.floorId = formData.floorId || undefined;
        payload.roomId = formData.roomId || undefined;
      }

      if (activeTab === "floors") {
        res = editingItem 
          ? await updateFloor(editingItem.id, payload) 
          : await createFloor(payload);
      } else if (activeTab === "rooms") {
        res = editingItem 
          ? await updateRoom(editingItem.id, payload) 
          : await createRoom(payload);
      } else if (activeTab === "wards") {
        res = editingItem 
          ? await updateWard(editingItem.id, payload) 
          : await createWard(payload);
      }

      if (res.success) {
        setSuccess(`${activeTab.slice(0, -1).toUpperCase()} ${editingItem ? 'updated' : 'created'} successfully!`);
        handleCloseModal();
        fetchData();
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(res.message || "Failed to save details.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let res;
      if (activeTab === "floors") {
        res = await deleteFloor(deleteConfirmItem.id);
      } else if (activeTab === "rooms") {
        res = await deleteRoom(deleteConfirmItem.id);
      } else if (activeTab === "wards") {
        res = await deleteWard(deleteConfirmItem.id);
      }

      if (res.success) {
        setSuccess(`${activeTab.slice(0, -1).toUpperCase()} deleted successfully!`);
        setDeleteConfirmItem(null);
        fetchData();
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(res.message || "Failed to delete item.");
      }
    } catch (err) {
      setError("An error occurred while deleting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtering Data
  const getFilteredItems = () => {
    let list = activeTab === "floors" ? floors : activeTab === "rooms" ? rooms : wards;
    return list.filter((item) => {
      const matchesSearch = 
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.type && item.type.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = 
        statusFilter === "ALL" || 
        (statusFilter === "Active" && item.status === "Active") ||
        (statusFilter === "Inactive" && item.status !== "Active") ||
        (statusFilter === "Available" && item.isAvailable === true);

      return matchesSearch && matchesStatus;
    });
  };

  const filteredItems = getFilteredItems();

  // Summary Metrics
  const totalFloors = floors.length;
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.isAvailable).length;
  const totalWards = wards.length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600 shrink-0" />
            Infrastructure Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your hospital floors, rooms, wards, capacities, and daily rates in one centralized place.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <Button 
            variant="outline" 
            onClick={fetchData} 
            disabled={loading}
            className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button 
            onClick={() => handleOpenModal()} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add {activeTab === "floors" ? "Floor" : activeTab === "rooms" ? "Room" : "Ward"}</span>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Floors</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalFloors}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Rooms</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalRooms}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <DoorOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Rooms</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{availableRooms}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Wards</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalWards}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <Bed className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <span className="text-sm font-medium">{success}</span>
          </div>
          <button onClick={() => setSuccess("")} className="text-emerald-400 hover:text-emerald-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-gray-200 pb-2">
        <div className="flex items-center bg-gray-100 p-1.5 rounded-xl self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("floors")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "floors"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Manage Floors</span>
            <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-700 font-bold">
              {floors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("rooms")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "rooms"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
            }`}
          >
            <DoorOpen className="h-4 w-4" />
            <span>Manage Rooms</span>
            <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-700 font-bold">
              {rooms.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("wards")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "wards"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
            }`}
          >
            <Bed className="h-4 w-4" />
            <span>Manage Wards</span>
            <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-700 font-bold">
              {wards.length}
            </span>
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            {activeTab !== "floors" && <option value="Available">Available</option>}
          </select>
        </div>
      </div>

      {/* Main Content Table / Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">Loading {activeTab}...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center p-6">
            <div className="h-16 w-16 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center mb-4">
              {activeTab === "floors" ? <Layers size={32} /> : activeTab === "rooms" ? <DoorOpen size={32} /> : <Bed size={32} />}
            </div>
            <h3 className="text-lg font-bold text-gray-800">No {activeTab} found</h3>
            <p className="text-sm text-gray-500 max-w-md mt-1">
              {searchTerm 
                ? `No results match your search "${searchTerm}".` 
                : `Get started by creating your first ${activeTab.slice(0, -1)} for this branch.`}
            </p>
            <Button 
              onClick={() => handleOpenModal()} 
              className="mt-5 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add {activeTab.slice(0, -1)}</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Name / Code</th>
                  {activeTab === "rooms" && <th className="py-4 px-6">Floor</th>}
                  {activeTab === "wards" && <th className="py-4 px-6">Floor</th>}
                  {activeTab === "wards" && <th className="py-4 px-6">Room</th>}
                  {activeTab !== "floors" && <th className="py-4 px-6">Capacity</th>}
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          activeTab === "floors" ? "bg-blue-50 text-blue-600" : activeTab === "rooms" ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-600"
                        }`}>
                          {item.code ? item.code.substring(0, 4) : item.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {item.name}
                          </div>
                          {item.code && (
                            <div className="text-xs text-gray-400 font-mono mt-0.5">
                              Code: {item.code}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {activeTab === "rooms" && (
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          <Layers className="h-3 w-3 text-blue-500" />
                          {item.floor?.name || floors.find(f => f.id === item.floorId)?.name || "Unassigned"}
                        </span>
                      </td>
                    )}

                    {activeTab === "wards" && (
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          <Layers className="h-3 w-3 text-blue-500" />
                          {item.floor?.name || floors.find(f => f.id === item.floorId)?.name || "Unassigned"}
                        </span>
                      </td>
                    )}

                    {activeTab === "wards" && (
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <DoorOpen className="h-3 w-3 text-emerald-500" />
                          {item.room?.name || rooms.find(r => r.id === item.roomId)?.name || "Unassigned"}
                        </span>
                      </td>
                    )}

                    {activeTab !== "floors" && (
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{item.capacity || 1} {item.capacity > 1 ? "Beds / Persons" : "Person"}</span>
                        </div>
                      </td>
                    )}

                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          item.status === "Active" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${item.status === "Active" ? "bg-emerald-500" : "bg-red-500"}`} />
                          {item.status || "Active"}
                        </span>

                        {activeTab !== "floors" && item.isAvailable !== undefined && (
                          <span className={`text-[10px] font-bold tracking-wider uppercase ${
                            item.isAvailable ? "text-teal-600" : "text-amber-600"
                          }`}>
                            {item.isAvailable ? "Available" : "Occupied"}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmItem(item)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Modal Dialog for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {activeTab === "floors" ? <Layers className="text-blue-600" /> : activeTab === "rooms" ? <DoorOpen className="text-emerald-600" /> : <Bed className="text-purple-600" />}
                {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add New ${activeTab.slice(0, -1)}`}
              </h2>
              <button 
                onClick={handleCloseModal} 
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(activeTab === "rooms" || activeTab === "wards") && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Floor *
                    </label>
                    <select
                      value={formData.floorId || ""}
                      onChange={(e) => {
                        const newFloorId = e.target.value;
                        setFormData({ 
                          ...formData, 
                          floorId: newFloorId,
                          roomId: ""
                        });
                      }}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">-- Select Floor --</option>
                      {floors.map((fl) => (
                        <option key={fl.id} value={fl.id}>
                          {fl.name} {fl.code ? `(${fl.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === "wards" && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Room *
                    </label>
                    <select
                      value={formData.roomId || ""}
                      onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!formData.floorId}
                      required
                    >
                      <option value="">
                        {!formData.floorId 
                          ? "-- Select a Floor First --" 
                          : "-- Select Available Room --"}
                      </option>
                      {rooms
                        .filter(rm => {
                          const matchesFloor = !formData.floorId || rm.floorId === formData.floorId || rm.floor?.id === formData.floorId;
                          const isCurrentlyAssigned = editingItem && (editingItem.roomId === rm.id || editingItem.room?.id === rm.id);
                          return matchesFloor && (rm.isAvailable || isCurrentlyAssigned);
                        })
                        .map((rm) => (
                          <option key={rm.id} value={rm.id}>
                            {rm.name} {rm.code ? `(${rm.code})` : ""} - [{rm.type || "General"}]
                          </option>
                        ))}
                    </select>
                    {!formData.floorId && (
                      <p className="text-xs text-amber-600 mt-1">Please select a floor above to view available rooms.</p>
                    )}
                  </div>
                )}

                <div className="sm:col-span-2">
                  <Input
                    label={`${activeTab.slice(0, -1)} Name *`}
                    placeholder={`e.g. ${activeTab === "floors" ? "Ground Floor" : activeTab === "rooms" ? "Room 101" : "Male General Ward"}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Code (Optional)"
                    placeholder={`e.g. ${activeTab === "floors" ? "FL-01" : activeTab === "rooms" ? "RM-101" : "WD-01"}`}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>

                {activeTab !== "floors" && (
                  <div>
                    <Input
                      label="Capacity (Persons / Beds)"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {activeTab !== "floors" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Availability
                    </label>
                    <select
                      value={formData.isAvailable ? "true" : "false"}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value === "true" })}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Available</option>
                      <option value="false">Occupied</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingItem ? "Update Details" : "Save & Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteConfirmItem.name}"</span>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setDeleteConfirmItem(null)} 
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDelete} 
                isLoading={isSubmitting}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
