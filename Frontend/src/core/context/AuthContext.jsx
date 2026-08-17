// client/src/context/AuthContext.jsx
import React, { useState, useEffect, createContext, useContext } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper: set axios default Authorization header when token is available
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // Sync token changes with Axios headers and LocalStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      setAuthHeader(token);
      // Optional: If you want to fetch current user profile details on page refresh
      fetchCurrentUser();
    } else {
      localStorage.removeItem("token");
      setAuthHeader(null);
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // Fetch the logged-in user profile using the active token
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("/auth/me");
      if (response.data.status === "success") {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error("Failed to authenticate session token:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Authentication Action: Handle User Login Session
  const login = async (email, password) => {
    try {
      // Matches your Express endpoint layout: /api/v1/auth/login
      const response = await axios.post("/auth/login", { email, password });
      
      if (response.data.status === "success") {
        const { accessToken, user } = response.data.data;
        setToken(accessToken);
        setUser(user);
        
        // Redirect based on mapped dashboard paths or fallback to permissions
        const roleWithDashboard = user.roles?.find(role => role.roleDashboards?.length > 0);
        
        let redirectPath = "/login";
        if (roleWithDashboard) {
          redirectPath = roleWithDashboard.roleDashboards[0].dashboard.path;
        } else {
          // Fallback based on permissions
          const userPermissions = user.roles?.flatMap(role => 
            role.rolePermissions?.map(p => p.permission.action) || []
          ) || [];

          if (userPermissions.includes("platform:access")) redirectPath = "/platformAdmin/overview";
          else if (userPermissions.includes("hospital:access")) redirectPath = "/hospital/overview";
          else if (userPermissions.includes("branch:access")) redirectPath = "/branch/dashboard";
        }
        
        navigate(redirectPath);

        return { success: true };
      }
      return { success: false, message: response.data.message || "Invalid credentials" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Authentication failed."
      };
    }
  };

  const createHospital = async (hospitalData) => {
    try {
      const response = await axios.post("/hospitals", hospitalData);
      console.log("Server Response:", response.data);
      if (response.data.status === "success") {
        return { success: true };
      }
      return { success: false, message: response.data.message || "Failed to create hospital" };
    } catch (error) {
      console.error("Exact Backend Error Details for Create:", error.response?.data);
      return { success: false, message: error.response?.data?.message || "Failed to create hospital" };
    }
  };

  const getHospitalById = async (id) => {
    try {
      const response = await axios.get(`/hospitals/${id}`);
      if (response.data.status === "success") {
        return { success: true, data: response.data.data.hospital };
      }
      return { success: false, message: response.data.message || "Failed to fetch hospital" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch hospital" };
    }
  };

  const updateHospital = async (id, hospitalData) => {
    try {
      const response = await axios.put(`/hospitals/${id}`, hospitalData);
      if (response.data.status === "success") {
        return { success: true };
      }
      return { success: false, message: response.data.message || "Failed to update hospital" };
    } catch (error) {
      console.error("Exact Backend Error Details:", error.response?.data);
      return { success: false, message: error.response?.data?.message || "Failed to update hospital" };
    }
  };

  const deleteHospital = async (id) => {
    try {
      const response = await axios.delete(`/hospitals/${id}`);
      if (response.data?.status === "success" || response.status === 204) {
        return { success: true };
      }
      return { success: false, message: response.data.message || "Failed to delete hospital" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to delete hospital" };
    }
  };

  const getAllHospitals = async () => {
    try {
      const response = await axios.get("/hospitals");
      if (response.data.status === "success") {
        return { success: true, data: response.data.data };
      }
      return { success: false, message: response.data.message || "Failed to fetch hospitals" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch hospitals" };
    }
  };

  const createHospAdmin = async (adminData) => {
    try {
      const response = await axios.post("/hospital-admins", adminData);
      if (response.data.status === "success") {
        return { success: true };
      }
      return { success: false, message: response.data.message || "Failed to create hospital admin" };
    } catch (error) {
      console.error("Exact Backend Error Details:", error.response?.data);
      return { success: false, message: error.response?.data?.message || "Failed to create hospital admin" };
    }
  };

  const UpdateHospAdmin = async (id, adminData) => {
    try {
      const response = await axios.put(`/hospital-admins/${id}`, adminData);
      if (response.data.status === "success") {
        return { success: true };
      }
      return { success: false, message: response.data.message || "Failed to update hospital admin" };
    } catch (error) {
      console.error("Exact Backend Error Details:", error.response?.data);
      return { success: false, message: error.response?.data?.message || "Failed to update hospital admin" };
    }
  };

  const getHospAdminById = async (id) => {
    try {
      const response = await axios.get(`/hospital-admins/${id}`);
      if (response.data.status === "success") {
        return { success: true, data: response.data.data.admin };
      }
      return { success: false, message: response.data.message || "Failed to fetch hospital admin" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch hospital admin" };
    }
  };

  const getAllHospAdmins = async () => {
    try {
      const response = await axios.get("/hospital-admins");
      if (response.data.status === "success") {
        return { success: true, data: response.data.data.admins };
      }
      return { success: false, message: response.data.message || "Failed to fetch hospital admins" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch hospital admins" };
    }
  };

  const deleteHospAdmin = async (id) => {
    try {
      const response = await axios.delete(`/hospital-admins/${id}`);
      if (response.data?.status === "success" || response.status === 204) {
        return { success: true };
      }
      return { success: false, message: response.data.message || "Failed to delete hospital admin" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to delete hospital admin" };
    }
  };

  const createHospitalTheme = async (themeData) => {
    try {
      const response = await axios.post("/hospital-themes", themeData);
      if (response.data.status === "success") {
        return { success: true, data: response.data.data.hospitalTheme };
      }
      return { success: false, message: response.data.message || "Failed to create theme" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to create theme" };
    }
  };

  const getHospitalTheme = async (hospitalId) => {
    try {
      const response = await axios.get(`/hospital-themes/${hospitalId}`);
      if (response.data.status === "success") {
        return { success: true, data: response.data.data.hospitalTheme };
      }
      return { success: false, message: response.data.message || "Failed to fetch theme" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch theme" };
    }
  };

  const updateHospitalTheme = async (hospitalId, themeData) => {
    try {
      const response = await axios.patch(`/hospital-themes/${hospitalId}`, themeData);
      if (response.data.status === "success") {
        return { success: true, data: response.data.data.hospitalTheme };
      }
      return { success: false, message: response.data.message || "Failed to update theme" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update theme" };
    }
  };


  const createBranch = async (hospitalId, branchData) => {
    try {
      const response = await axios.post(`/branches/hospital/${hospitalId}`, branchData);
      if (response.data.status === "success") {
        return { success: true, data: response.data.data.branch };
      }
      return { success: false, message: response.data.message || "Failed to create branch" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to create branch" };
    }
  };

  const getAllBranches = async (hospitalId) => {
    try {
      const response = await axios.get(`/branches/hospital/${hospitalId}`);
      if (response.data.status === "success") {
        return { success: true, data: response.data.data.branches };
      }
      return { success: false, message: response.data.message || "Failed to fetch branches" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch branches" };
    }
  };

  const updateBranch = async (branchId, branchData) => {
    try {
      const response = await axios.patch(`/branches/${branchId}`, branchData);
      if (response.data.status === "success") {
        return { success: true, data: response.data.data.branch };
      }
      return { success: false, message: response.data.message || "Failed to update branch" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update branch" };
    }
  };

  const deleteBranch = async (branchId) => {
    try {
      const response = await axios.delete(`/branches/${branchId}`);
      if (response.data?.status === "success" || response.status === 204) {
        return { success: true };
      }
      return { success: false, message: response.data.message || "Failed to delete branch" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to delete branch" };
    }
  };

  const getAllBranchesByHospitalId = async (hospitalId) => {
    try {
      const response = await axios.get(`/branches/hospital/${hospitalId}`);
      if (response.data.status === "success") {
        return { success: true, data: response.data.data.branches };
      }
      return { success: false, message: response.data.message || "Failed to fetch branches" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch branches" };
    }
  };

  const createBranchAdmin = async (branchAdminData) => {
    try {
      const response = await axios.post("/branch-admins", branchAdminData);
      if (response.data.status === "success") {
        return { success: true, data: response.data.data.branchAdmin };
      }
      return { success: false, message: response.data.message || "Failed to create branch admin" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to create branch admin" };
    }
  };

  const getBranchAdminById = async (id) => {
    try {
      const response = await axios.get(`/branch-admins/${id}`);
      if (response.data.status === "success") {
        return { success: true, data: response.data.data.branchAdmin };
      }
      return { success: false, message: response.data.message || "Failed to fetch branch admin" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch branch admin" };
    }
  };

  const getAllBranchAdmins = async (hospitalId) => {
    try {
      const url = hospitalId ? `/branch-admins?hospitalId=${hospitalId}` : "/branch-admins";
      const response = await axios.get(url);
      if (response.data.status === "success") {
        return { success: true, data: response.data.data.branchAdmins };
      }
      return { success: false, message: response.data.message || "Failed to fetch branch admins" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch branch admins" };
    }
  };


  const updateBranchAdmin = async (id, branchAdminData) => {
    try {
      const response = await axios.put(`/branch-admins/${id}`, branchAdminData);
      if (response.data.status === "success") {
        return { success: true, data: response.data.data.branchAdmin };
      }
      return { success: false, message: response.data.message || "Failed to update branch admin" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update branch admin" };
    }
  };

  const deleteBranchAdmin = async (id) => {
    try {
      const response = await axios.delete(`/branch-admins/${id}`);
      console.log("Delete Response:", response);
      if (response.data.status === "success") {
        return { success: true, data: response.data.data?.branchAdmin || null };
      }
      return { success: false, message: response.data.message || "Failed to delete branch admin" };
    } catch (error) {
      console.error("Delete Error:", error);
      return { success: false, message: error.response?.data?.message || "Failed to delete branch admin" };
    }
  };
  
  const getAllRoles = async (scope = "") => {
    try {
      const url = scope ? `/roles?scope=${scope}` : "/roles";
      const response = await axios.get(url);
      if (response.data.status === "success") {
        return { success: true, data: response.data.data.roles || response.data.data };
      }
      return { success: false, message: response.data.message || "Failed to fetch roles" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch roles" };
    }
  };

  // Authentication Action: Terminate Session Footprint
  const logout = async () => {
    try {
      // Call backend to clear the httpOnly refresh token cookie
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("Failed to cleanly logout from server:", error);
    } finally {
      // Clear local state and storage regardless of server response
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const createDepartment = async (departmentData) =>{
    try {
      const response = await axios.post("/department/create", departmentData);
      if(response.data.success){
        return {success: true, data: response.data.data}
      }
      return {success: false, message: response.data.message || "Failed to create department"}
    } catch (error) {
      return {success: false, message: error.response?.data?.message || "Failed to create department"}
    }
  }

  const getallDepartment = async () =>{
    try {
      const response = await axios.get("/department");
      if(response.data.success){
        return {success: true, data: response.data.data}
      }
      return {success: false, message: response.data.message || "Failed to fetch departments"}
    } catch (error) {
      return {success: false, message: error.response?.data?.message || "Failed to fetch departments"}
    }
  }

  const getdepartmentById = async (id) =>{
    try {
      const response = await axios.get(`/department/${id}`);
      if(response.data.success){
        return {success: true, data: response.data.data}
      }
      return {success: false, message: response.data.message || "Failed to fetch department"}
    } catch (error) {
      return {success: false, message: error.response?.data?.message || "Failed to fetch department"}
    }
  }

  const updateDepartment = async (id, data) =>{ 
    try {
      const response = await axios.put(`/department/${id}`,data);
      if(response.data.success){
        return {success: true, data: response.data.data}
      }
      return {success: false, message: response.data.message || "Failed to update department"}
    } catch (error) {
      return {success: false, message: error.response?.data?.message || "Failed to update department"}
    }
  }

  const deleteDepartment = async (id) =>{
    try {
      const response = await axios.delete(`/department/${id}`);
      if(response.data.success){
        return {success: true, data: response.data.data}
      }
      return {success: false, message: response.data.message || "Failed to delete department"}
    } catch (error) {
      return {success: false, message: error.response?.data?.message || "Failed to delete department"}
    }
  }

  // Flattened array of all permissions from all assigned roles
  const userPermissions = user?.roles?.flatMap(role => 
    role.rolePermissions?.map(p => p.permission.action) || []
  ) || [];

  // Provide state data globally across child components
  const value = {
    user,
    token,
    userPermissions,
    loading,
    login,
    logout,
    createHospital,
    getHospitalById,
    updateHospital,
    deleteHospital,
    getAllHospitals,
    createHospAdmin,
    UpdateHospAdmin,
    getHospAdminById,
    deleteHospAdmin,
    getAllHospAdmins,
    createHospitalTheme,
    getHospitalTheme,
    updateHospitalTheme,
    createBranch,
    getAllBranches,
    updateBranch,
    deleteBranch,
    getAllBranchesByHospitalId,
    createBranchAdmin,
    getBranchAdminById,
    updateBranchAdmin,
    deleteBranchAdmin,
    getAllBranchAdmins,
    getAllRoles,
    createDepartment,
    getallDepartment,
    getdepartmentById,
    updateDepartment,
    deleteDepartment
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;