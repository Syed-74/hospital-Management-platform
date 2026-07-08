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
        
        // Extract role names for easy checking
        const userRoles = user.roles?.map(role => role.name.toUpperCase().replace(/\s+/g, '_')) || [];
        
        // Redirect based on user's default path or default role path
        const roleWithDefaultPath = user.roles?.find(role => role.defaultPath);
        const redirectPath = roleWithDefaultPath?.defaultPath || "/login";
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
  
  // Authentication Action: Terminate Session Footprint
  const logout = () => {
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  // Flattened array of all permissions from all assigned roles
  const userPermissions = user?.roles?.flatMap(role => 
    role.permissions?.map(p => p.action) || []
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
    getAllHospAdmins
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;