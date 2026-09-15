import React, { useState } from 'react';
import { 
  User, Bell, Shield, Key, Globe, Palette, MonitorSmartphone, Mail, Smartphone, 
  AlertTriangle, Crown, Camera, Phone, RotateCcw, Check, Lock, Settings as SettingsIcon, 
  Upload, Info, ChevronDown, RefreshCw
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);

  // Form State
  const initialFormData = {
    firstName: 'Platform',
    lastName: 'Admin',
    email: 'admin@platform.com',
    phone: '+91 98765 43210',
    timezone: '(GMT+05:30) Asia/Kolkata',
    displayName: 'Platform Admin',
    about: 'Platform administrator responsible for managing hospitals, admins, permissions and platform configurations.'
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setIsSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const tabs = [
    { 
      id: 'profile', 
      name: 'Profile & Account', 
      desc: 'Manage your personal information',
      icon: User 
    },
    { 
      id: 'security', 
      name: 'Security & Access', 
      desc: 'Password, 2FA and session management',
      icon: Shield 
    },
    { 
      id: 'notifications', 
      name: 'Notifications', 
      desc: 'Email and in-app notifications',
      icon: Bell 
    },
    { 
      id: 'appearance', 
      name: 'Appearance', 
      desc: 'Theme, language and display preferences',
      icon: Palette 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header & Platform Configuration Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Overview</span>
            <span>&gt;</span>
            <span className="text-slate-600">Settings</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm shrink-0">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Settings</h1>
              <p className="text-xs text-slate-500">Manage your platform preferences, security configurations, and notifications.</p>
            </div>
          </div>
        </div>

        {/* Right Info Banner */}
        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950">Platform Configuration</h4>
            <p className="text-[11px] text-emerald-700">Changes made here will apply across the entire platform.</p>
          </div>
        </div>
      </div>

      {/* Save Toast Alert */}
      {isSaved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-emerald-800 text-xs font-semibold shadow-sm animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Main Grid: Vertical Tabs & Form Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Sidebar Vertical Navigation */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-2 space-y-1.5 shadow-sm">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full text-left flex items-start space-x-3.5 p-3 rounded-xl transition-all cursor-pointer
                    ${isActive 
                      ? 'bg-teal-50/80 border-l-4 border-teal-600 text-teal-950 shadow-xs' 
                      : 'border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isActive ? 'bg-teal-100/80 text-teal-700' : 'bg-slate-100 text-slate-400'}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold ${isActive ? 'text-teal-950' : 'text-slate-800'}`}>
                      {tab.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5 line-clamp-1">
                      {tab.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              
              {/* Tab Header */}
              <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Profile &amp; Account</h3>
                  <p className="text-xs text-slate-400">Update your personal details and public profile information.</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-7">
                
                {/* Avatar & Role Header Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  {/* Avatar Upload */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-white">
                        PA
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </div>
                    <div>
                      <button 
                        type="button" 
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                        Change Avatar
                      </button>
                      <p className="text-[11px] text-slate-400 mt-1">JPG, PNG or GIF. Max size 1MB.</p>
                    </div>
                  </div>

                  {/* Admin Role Card */}
                  <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                        <Crown className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Platform Administrator</h4>
                        <p className="text-[11px] text-slate-500">Full access to all platform features</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">Personal Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" 
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-9 pr-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">Additional Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Time Zone</label>
                      <div className="relative">
                        <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select 
                          name="timezone"
                          value={formData.timezone}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all cursor-pointer"
                        >
                          <option value="(GMT+05:30) Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                          <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                          <option value="(GMT-05:00) Eastern Time (US &amp; Canada)">(GMT-05:00) Eastern Time (US &amp; Canada)</option>
                          <option value="(GMT+01:00) Central European Time">(GMT+01:00) Central European Time</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Public Profile */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">Public Profile</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Display Name</label>
                      <input 
                        type="text" 
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" 
                      />
                      <p className="text-[11px] text-slate-400 mt-1">This name will be visible across the platform.</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-700">About</label>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {formData.about.length}/500
                        </span>
                      </div>
                      <textarea 
                        name="about"
                        rows={3}
                        value={formData.about}
                        onChange={handleInputChange}
                        maxLength={500}
                        className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all resize-none" 
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button 
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    Reset
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                    <Shield className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Change Password</h3>
                    <p className="text-xs text-slate-400">Ensure your account is using a long, random password to stay secure.</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full lg:w-2/3 px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full lg:w-2/3 px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full lg:w-2/3 px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all" />
                  </div>
                </div>
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                  <button className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-red-100 bg-red-50/40 flex items-center space-x-2.5">
                  <AlertTriangle className="w-4.5 h-4.5 text-red-600 shrink-0" />
                  <h3 className="text-sm font-bold text-red-900">Danger Zone</h3>
                </div>
                <div className="p-6">
                  <p className="text-xs text-slate-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  <button className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors shadow-xs cursor-pointer">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Notification Preferences</h3>
                  <p className="text-xs text-slate-400">Choose how and when you want to be notified.</p>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Email Alerts</p>
                      <p className="text-[11px] text-slate-400">Receive daily digest of platform events.</p>
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer" />
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Push Notifications</p>
                      <p className="text-[11px] text-slate-400">Receive instant alerts for critical system events.</p>
                    </div>
                  </div>
                  <input type="checkbox" className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                  <Palette className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Theme Preferences</h3>
                  <p className="text-xs text-slate-400">Customize how the platform looks on your device.</p>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border-2 border-teal-600 rounded-xl p-4 cursor-pointer relative bg-teal-50/20 shadow-xs">
                    <MonitorSmartphone className="w-6 h-6 text-teal-600 mb-2" />
                    <p className="text-xs font-bold text-slate-900">System Auto</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Syncs with your OS</p>
                  </div>
                  <div className="border border-slate-200 hover:border-slate-300 rounded-xl p-4 cursor-pointer relative bg-white shadow-xs">
                    <div className="w-6 h-6 rounded bg-slate-100 mb-2 flex items-center justify-center text-xs font-bold text-slate-500">A</div>
                    <p className="text-xs font-bold text-slate-900">Light Mode</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Classic white theme</p>
                  </div>
                  <div className="border border-slate-800 rounded-xl p-4 cursor-pointer relative bg-slate-900 shadow-xs text-white">
                    <div className="w-6 h-6 rounded bg-slate-800 mb-2 flex items-center justify-center text-xs font-bold text-slate-400">A</div>
                    <p className="text-xs font-bold text-white">Dark Mode</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Easy on the eyes</p>
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