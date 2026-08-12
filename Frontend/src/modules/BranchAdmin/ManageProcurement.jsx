import React from 'react';
import { Settings } from 'lucide-react';

export default function ManageProcurement() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="text-blue-600" /> Procurement
          </h1>
          <p className="text-gray-500 text-sm mt-1">This module is currently under construction.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-64 flex flex-col items-center justify-center">
        <div className="animate-pulse rounded-full h-12 w-12 bg-gray-100 flex items-center justify-center mb-4">
          <Settings className="text-gray-300 h-6 w-6" />
        </div>
        <p className="text-gray-500 font-medium text-lg">Coming Soon</p>
        <p className="text-gray-400 mt-1">We are actively building this feature.</p>
      </div>
    </div>
  );
}