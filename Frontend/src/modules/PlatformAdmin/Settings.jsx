import React, { useState } from 'react';
import { User, Bell, Shield, Key, Globe, Palette, MonitorSmartphone, Mail, Smartphone, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile & Account', icon: User },
    { id: 'security', name: 'Security & Access', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your platform preferences, security configurations, and notifications.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Vertical Tabs Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-col space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center px-6 py-3 text-sm font-semibold transition-all
                  ${activeTab === tab.id 
                    ? 'bg-teal-50/70 text-teal-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                {activeTab === tab.id && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-teal-700" />
                )}
                <tab.icon className={`mr-4 h-5 w-5 ${activeTab === tab.id ? 'text-teal-700' : 'text-gray-400'}`} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                  <p className="text-sm text-gray-500 mt-1">Update your personal details and public profile.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="h-20 w-20 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-2xl font-bold uppercase shadow-sm border border-teal-200">
                      PA
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        Change Avatar
                      </button>
                      <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                      <input type="text" defaultValue="Platform" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                      <input type="text" defaultValue="Admin" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                      <input type="email" defaultValue="admin@platform.com" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors" />
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button className="px-5 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm">Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                  <p className="text-sm text-gray-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full lg:w-2/3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full lg:w-2/3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full lg:w-2/3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors" />
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button className="px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm">Update Password</button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-red-100 bg-red-50/50">
                  <h3 className="text-lg font-bold text-red-700 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Danger Zone
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  <button className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm">Delete Account</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
                  <p className="text-sm text-gray-500 mt-1">Choose how and when you want to be notified.</p>
                </div>
                <div className="divide-y divide-gray-100">
                  
                  <div className="p-6 flex items-start justify-between">
                    <div className="flex items-start">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email Alerts</p>
                        <p className="text-sm text-gray-500">Receive daily digest of platform events.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>

                  <div className="p-6 flex items-start justify-between">
                    <div className="flex items-start">
                      <Smartphone className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-500">Receive instant alerts for critical system events.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                  
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Theme Preferences</h3>
                  <p className="text-sm text-gray-500 mt-1">Customize how the platform looks on your device.</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    <div className="border-2 border-teal-600 rounded-xl p-4 cursor-pointer relative overflow-hidden bg-gray-50 shadow-sm">
                      <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-teal-600 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>
                      <MonitorSmartphone className="w-8 h-8 text-teal-600 mb-3" />
                      <p className="text-sm font-semibold text-gray-900">System Auto</p>
                      <p className="text-xs text-gray-500 mt-1">Syncs with your OS</p>
                    </div>

                    <div className="border-2 border-transparent hover:border-gray-200 rounded-xl p-4 cursor-pointer relative overflow-hidden bg-white shadow-sm transition-colors">
                      <div className="h-8 w-8 rounded bg-gray-100 mb-3 border border-gray-200 flex items-center justify-center text-gray-500">
                        A
                      </div>
                      <p className="text-sm font-semibold text-gray-900">Light Mode</p>
                      <p className="text-xs text-gray-500 mt-1">Classic white theme</p>
                    </div>

                    <div className="border-2 border-transparent hover:border-gray-700 rounded-xl p-4 cursor-pointer relative overflow-hidden bg-gray-900 shadow-sm transition-colors">
                      <div className="h-8 w-8 rounded bg-gray-800 mb-3 border border-gray-700 flex items-center justify-center text-gray-400">
                        A
                      </div>
                      <p className="text-sm font-semibold text-white">Dark Mode</p>
                      <p className="text-xs text-gray-400 mt-1">Easy on the eyes</p>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}