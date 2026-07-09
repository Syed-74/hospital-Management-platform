import React, { useState, useEffect } from 'react';
import { useAuth } from '../../core/context/AuthContext';
import { Palette, Search, Save, CheckCircle2, AlertCircle, Building2, Layout, Type, MousePointer2 } from 'lucide-react';

const THEME_INITIAL_STATE = {
  primaryColor: '#2563EB',
  secondaryColor: '#1E40AF',
  accentColor: '#10B981',
  sidebarColor: '#FFFFFF',
  sidebarTextColor: '#1F2937',
  headerColor: '#FFFFFF',
  headerTextColor: '#111827',
  backgroundColor: '#F8FAFC',
  cardColor: '#FFFFFF',
  borderColor: '#E5E7EB',
  buttonColor: '#2563EB',
  buttonTextColor: '#FFFFFF',
  linkColor: '#2563EB',
  successColor: '#22C55E',
  warningColor: '#F59E0B',
  errorColor: '#EF4444',
  fontFamily: 'Inter',
  fontSize: 'medium',
  themeMode: 'light',
  borderRadius: '8px',
  showHospitalLogo: true,
  showHospitalName: true,
  enableAnimations: true
};

const ColorInput = ({ label, name, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-700">{label}</label>
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          name={name}
          value={value}
          onChange={onChange}
          className="w-10 h-10 rounded cursor-pointer border-0 p-0"
        />
        <div className="absolute inset-0 rounded ring-1 ring-inset ring-black/10 pointer-events-none" />
      </div>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-24 px-2.5 py-1.5 text-sm font-mono bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 uppercase"
      />
    </div>
  </div>
);

export default function ThemeManagement() {
  const { getAllHospitals, getHospitalTheme, createHospitalTheme, updateHospitalTheme } = useAuth();
  
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [themeData, setThemeData] = useState(THEME_INITIAL_STATE);
  const [isExistingTheme, setIsExistingTheme] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (selectedHospital) {
      fetchTheme(selectedHospital.id);
    } else {
      setThemeData(THEME_INITIAL_STATE);
      setIsExistingTheme(false);
    }
  }, [selectedHospital]);

  const fetchHospitals = async () => {
    setIsLoading(true);
    const result = await getAllHospitals();
    if (result.success) {
      setHospitals(result.data?.hospitals || result.data || []);
    }
    setIsLoading(false);
  };

  const fetchTheme = async (hospitalId) => {
    setIsLoading(true);
    setFeedback({ type: '', message: '' });
    const result = await getHospitalTheme(hospitalId);
    
    if (result.success && result.data) {
      // Merge retrieved theme with our local state keys so we don't drop anything
      setThemeData({ ...THEME_INITIAL_STATE, ...result.data });
      setIsExistingTheme(true);
    } else {
      setThemeData(THEME_INITIAL_STATE);
      setIsExistingTheme(false);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setThemeData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    if (!selectedHospital) return;
    
    setIsSaving(true);
    setFeedback({ type: '', message: '' });
    
    let result;
    if (isExistingTheme) {
      result = await updateHospitalTheme(selectedHospital.id, themeData);
    } else {
      // Must include hospitalId for creation
      result = await createHospitalTheme({ ...themeData, hospitalId: selectedHospital.id });
    }

    if (result.success) {
      setIsExistingTheme(true);
      setFeedback({ type: 'success', message: 'Theme settings saved successfully!' });
      setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
    } else {
      setFeedback({ type: 'error', message: result.message || 'Failed to save theme settings.' });
    }
    
    setIsSaving(false);
  };

  const filteredHospitals = hospitals.filter(h => 
    h.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.hospitalCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 tracking-tight">
            <Palette className="w-6 h-6 text-teal-600" />
            Theme Management
          </h1>
          <p className="text-gray-500 mt-1">Configure white-label branding and UI settings for individual tenants.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Left Column: Hospital Selector */}
        <div className="w-80 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search tenant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading && !selectedHospital ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
              </div>
            ) : filteredHospitals.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No hospitals found.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredHospitals.map(hospital => (
                  <button
                    key={hospital.id}
                    onClick={() => setSelectedHospital(hospital)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center ${
                      selectedHospital?.id === hospital.id 
                        ? 'bg-teal-50 border border-teal-100' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded flex items-center justify-center text-xs font-bold shrink-0 ${
                      selectedHospital?.id === hospital.id ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {hospital.hospitalName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="ml-3 overflow-hidden">
                      <div className={`text-sm font-semibold truncate ${
                        selectedHospital?.id === hospital.id ? 'text-teal-900' : 'text-gray-900'
                      }`}>
                        {hospital.hospitalName}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{hospital.hospitalCode}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Theme Configuration */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {!selectedHospital ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <Building2 className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">No Tenant Selected</p>
              <p className="text-sm">Select a tenant from the list to configure their theme.</p>
            </div>
          ) : (
            <>
              {/* Config Header */}
              <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedHospital.hospitalName}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">{selectedHospital.hospitalCode}</span>
                    <span>•</span>
                    <span className="text-teal-600 font-medium">{isExistingTheme ? 'Updating existing theme' : 'Creating new theme'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {feedback.message && (
                    <div className={`flex items-center gap-1.5 text-sm font-medium animate-in fade-in slide-in-from-right-4 ${
                      feedback.type === 'success' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {feedback.message}
                    </div>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-semibold shadow-sm"
                  >
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Configuration
                  </button>
                </div>
              </div>

              {/* Config Body */}
              <div className="flex-1 overflow-y-auto p-8">
                {isLoading ? (
                  <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                ) : (
                  <div className="max-w-4xl space-y-10">
                    
                    {/* Brand Colors */}
                    <section>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-gray-100 pb-2">
                        <Palette className="w-4 h-4 text-teal-600" /> Brand Colors
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <ColorInput label="Primary" name="primaryColor" value={themeData.primaryColor} onChange={handleInputChange} />
                        <ColorInput label="Secondary" name="secondaryColor" value={themeData.secondaryColor} onChange={handleInputChange} />
                        <ColorInput label="Accent" name="accentColor" value={themeData.accentColor} onChange={handleInputChange} />
                        <ColorInput label="Links" name="linkColor" value={themeData.linkColor} onChange={handleInputChange} />
                      </div>
                    </section>

                    {/* Layout Colors */}
                    <section>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-gray-100 pb-2">
                        <Layout className="w-4 h-4 text-teal-600" /> Layout & Structural Colors
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <ColorInput label="Background" name="backgroundColor" value={themeData.backgroundColor} onChange={handleInputChange} />
                        <ColorInput label="Card Base" name="cardColor" value={themeData.cardColor} onChange={handleInputChange} />
                        <ColorInput label="Borders" name="borderColor" value={themeData.borderColor} onChange={handleInputChange} />
                        <div />
                        <ColorInput label="Sidebar BG" name="sidebarColor" value={themeData.sidebarColor} onChange={handleInputChange} />
                        <ColorInput label="Sidebar Text" name="sidebarTextColor" value={themeData.sidebarTextColor} onChange={handleInputChange} />
                        <ColorInput label="Header BG" name="headerColor" value={themeData.headerColor} onChange={handleInputChange} />
                        <ColorInput label="Header Text" name="headerTextColor" value={themeData.headerTextColor} onChange={handleInputChange} />
                      </div>
                    </section>

                    {/* Component Colors */}
                    <section>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-gray-100 pb-2">
                        <MousePointer2 className="w-4 h-4 text-teal-600" /> Component Colors
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <ColorInput label="Button BG" name="buttonColor" value={themeData.buttonColor} onChange={handleInputChange} />
                        <ColorInput label="Button Text" name="buttonTextColor" value={themeData.buttonTextColor} onChange={handleInputChange} />
                        <div className="col-span-2 hidden md:block" />
                        <ColorInput label="Success" name="successColor" value={themeData.successColor} onChange={handleInputChange} />
                        <ColorInput label="Warning" name="warningColor" value={themeData.warningColor} onChange={handleInputChange} />
                        <ColorInput label="Error" name="errorColor" value={themeData.errorColor} onChange={handleInputChange} />
                      </div>
                    </section>

                    {/* Typography & UI */}
                    <section>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-gray-100 pb-2">
                        <Type className="w-4 h-4 text-teal-600" /> Typography & UI Settings
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">Font Family</label>
                          <select 
                            name="fontFamily" 
                            value={themeData.fontFamily} 
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                          >
                            <option value="Inter">Inter (Default)</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Lato">Lato</option>
                            <option value="Montserrat">Montserrat</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">Base Font Size</label>
                          <select 
                            name="fontSize" 
                            value={themeData.fontSize} 
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                          >
                            <option value="small">Small (12px)</option>
                            <option value="medium">Medium (14px)</option>
                            <option value="large">Large (16px)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">Border Radius</label>
                          <select 
                            name="borderRadius" 
                            value={themeData.borderRadius} 
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                          >
                            <option value="0px">Sharp (0px)</option>
                            <option value="4px">Slight (4px)</option>
                            <option value="8px">Rounded (8px)</option>
                            <option value="12px">Extra Rounded (12px)</option>
                            <option value="9999px">Pill (9999px)</option>
                          </select>
                        </div>
                      </div>
                    </section>

                    {/* Feature Toggles */}
                    <section>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-gray-100 pb-2">
                        <Layout className="w-4 h-4 text-teal-600" /> Application Features
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <label className="flex items-start p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="flex items-center h-5">
                            <input type="checkbox" name="showHospitalLogo" checked={themeData.showHospitalLogo} onChange={handleInputChange} className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-600" />
                          </div>
                          <div className="ml-3 text-sm">
                            <span className="font-semibold text-gray-900 block">Show Hospital Logo</span>
                            <span className="text-gray-500">Display the tenant's logo in the sidebar and auth pages.</span>
                          </div>
                        </label>

                        <label className="flex items-start p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="flex items-center h-5">
                            <input type="checkbox" name="showHospitalName" checked={themeData.showHospitalName} onChange={handleInputChange} className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-600" />
                          </div>
                          <div className="ml-3 text-sm">
                            <span className="font-semibold text-gray-900 block">Show Hospital Name</span>
                            <span className="text-gray-500">Display the tenant's text name next to the logo.</span>
                          </div>
                        </label>

                        <label className="flex items-start p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="flex items-center h-5">
                            <input type="checkbox" name="enableAnimations" checked={themeData.enableAnimations} onChange={handleInputChange} className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-600" />
                          </div>
                          <div className="ml-3 text-sm">
                            <span className="font-semibold text-gray-900 block">Enable Animations</span>
                            <span className="text-gray-500">Allow page transitions and micro-interactions.</span>
                          </div>
                        </label>

                      </div>
                    </section>

                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}