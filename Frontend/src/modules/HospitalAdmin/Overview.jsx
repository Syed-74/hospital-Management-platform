import React from 'react';
import { useAuth } from '../../core/context/AuthContext';

export default function Overview() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Hospital Overview</h1>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Welcome to {user?.hospital?.hospitalName || 'your dashboard'}</h2>
        <p className="text-gray-600">
          This dashboard is dynamically generated based on your assigned roles and permissions. 
          Use the sidebar to navigate through the modules you have access to.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Patients</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">1,245</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Active Staff</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">84</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Today's Appointments</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">32</p>
        </div>
      </div>
    </div>
  );
}
