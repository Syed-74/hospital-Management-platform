import React from 'react';

export default function StaffManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-theme-header-text">Staff Management</h1>
        <button className="bg-theme-button text-theme-button-text px-4 py-2 rounded-theme font-medium hover:opacity-90 transition-opacity">
          Add Staff Member
        </button>
      </div>
      
      <div className="bg-theme-card p-8 rounded-theme shadow-sm border border-theme-border text-center">
        <div className="mx-auto w-16 h-16 bg-theme-primary/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-theme-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-theme-header-text">Hospital Staff Module</h2>
        <p className="mt-2 text-theme-sidebar-text/70 max-w-lg mx-auto">
          This is a placeholder for the Staff Management module. Because you have the <code className="bg-theme-sidebar/50 text-theme-sidebar-text px-1 rounded border border-theme-border/50">hospitalUsers:manage</code> permission, you are able to view and interact with this page.
        </p>
      </div>
    </div>
  );
}
