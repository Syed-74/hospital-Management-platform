import React from 'react';
import { useAuth } from '../../core/context/AuthContext';

export default function Overview() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-theme-header-text">Hospital Overview</h1>
      </div>
      
      <div className="bg-theme-card p-6 rounded-theme shadow-sm border border-theme-border">
        <h2 className="text-lg font-semibold text-theme-header-text/90 mb-2">Welcome to {user?.hospital?.hospitalName || 'your dashboard'}</h2>
        <p className="text-theme-sidebar-text/80">
          This dashboard is dynamically generated based on your assigned roles and permissions. 
          Use the sidebar to navigate through the modules you have access to.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder Stats */}
        <div className="bg-theme-card p-6 rounded-theme shadow-sm border border-theme-border">
          <p className="text-sm font-medium text-theme-sidebar-text/60">Total Patients</p>
          <p className="text-3xl font-bold text-theme-primary mt-2">1,245</p>
        </div>
        <div className="bg-theme-card p-6 rounded-theme shadow-sm border border-theme-border">
          <p className="text-sm font-medium text-theme-sidebar-text/60">Active Staff</p>
          <p className="text-3xl font-bold text-theme-primary mt-2">84</p>
        </div>
        <div className="bg-theme-card p-6 rounded-theme shadow-sm border border-theme-border">
          <p className="text-sm font-medium text-theme-sidebar-text/60">Today's Appointments</p>
          <p className="text-3xl font-bold text-theme-primary mt-2">32</p>
        </div>
      </div>
    </div>
  );
}
