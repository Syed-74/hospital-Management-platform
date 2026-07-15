import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

// Utility to convert hex to space-separated RGB for Tailwind opacity support if needed
const hexToRgb = (hex) => {
  if (!hex) return null;
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
};

const THEME_INITIAL_STATE = {
  primaryColor: '#0D9488',
  secondaryColor: '#0F766E',
  accentColor: '#10B981',
  sidebarColor: '#FFFFFF',
  sidebarTextColor: '#374151',
  headerColor: '#FFFFFF',
  headerTextColor: '#111827',
  backgroundColor: '#F8FAFC',
  cardColor: '#FFFFFF',
  borderColor: '#E5E7EB',
  buttonColor: '#0D9488',
  buttonTextColor: '#FFFFFF',
  linkColor: '#0D9488',
  successColor: '#22C55E',
  warningColor: '#F59E0B',
  errorColor: '#EF4444',
  fontFamily: 'Inter',
  borderRadius: '8px',
  showHospitalLogo: true,
  showHospitalName: true,
  enableAnimations: true
};

export const ThemeProvider = ({ children }) => {
  const { user, getHospitalTheme, token } = useAuth();

  // Helper to inject both hex and RGB variables into DOM document element
  const applyThemeToDOM = (t) => {
    const root = document.documentElement;
    const setProp = (name, hexValue) => {
      if (hexValue) {
        root.style.setProperty(`--color-${name}`, hexValue);
        root.style.setProperty(`--color-${name}-rgb`, hexToRgb(hexValue));
      }
    };

    // Set colors
    setProp('primary', t.primaryColor);
    setProp('secondary', t.secondaryColor);
    setProp('accent', t.accentColor);
    setProp('sidebar', t.sidebarColor);
    setProp('sidebar-text', t.sidebarTextColor);
    setProp('header', t.headerColor);
    setProp('header-text', t.headerTextColor);
    setProp('bg', t.backgroundColor);
    setProp('card', t.cardColor);
    setProp('border', t.borderColor);
    setProp('button', t.buttonColor);
    setProp('button-text', t.buttonTextColor);
    setProp('link', t.linkColor);
    setProp('success', t.successColor);
    setProp('warning', t.warningColor);
    setProp('error', t.errorColor);
    
    // Typography & UI
    if (t.fontFamily) root.style.setProperty('--font-family', t.fontFamily);
    if (t.borderRadius) root.style.setProperty('--border-radius', t.borderRadius);
  };

  // Synchronously load theme from localStorage if cached
  const getInitialTheme = () => {
    if (user?.hospitalId) {
      const cached = localStorage.getItem(`hms_theme_${user.hospitalId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          applyThemeToDOM(parsed);
          return parsed;
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    // Set fallback defaults
    applyThemeToDOM(THEME_INITIAL_STATE);
    return THEME_INITIAL_STATE;
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Sync cache if user hospital context changes
  useEffect(() => {
    if (user?.hospitalId) {
      const cached = localStorage.getItem(`hms_theme_${user.hospitalId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setTheme(parsed);
          applyThemeToDOM(parsed);
          setIsLoading(false);
          return;
        } catch (e) {}
      }
    }
    setIsLoading(true);
  }, [user?.hospitalId]);

  useEffect(() => {
    const fetchAndApplyTheme = async () => {
      if (user?.hospitalId && token) {
        const result = await getHospitalTheme(user.hospitalId);
        const t = (result.success && result.data) 
          ? { ...THEME_INITIAL_STATE, ...result.data }
          : THEME_INITIAL_STATE;
        
        // Cache in localStorage
        localStorage.setItem(`hms_theme_${user.hospitalId}`, JSON.stringify(t));
        
        setTheme(t);
        applyThemeToDOM(t);
        setIsLoading(false);
      } else {
        applyThemeToDOM(THEME_INITIAL_STATE);
        setIsLoading(false);
      }
    };

    fetchAndApplyTheme();
  }, [user?.hospitalId, token]);

  return (
    <ThemeContext.Provider value={{ theme, isLoading }}>
      {isLoading && !theme.hospitalId && user?.hospitalId ? (
        /* Premium clinical loading curtain during first cold boot fetch */
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <div className="flex flex-col items-center text-center space-y-1">
              <span className="text-sm font-extrabold tracking-widest text-teal-400 uppercase">MediFlow ERP</span>
              <span className="text-xs font-semibold text-slate-400">Applying Organization Branding Profile...</span>
            </div>
          </div>
        </div>
      ) : null}
      <div 
        className="font-sans min-h-screen text-gray-900 transition-colors duration-300"
        style={{ 
          backgroundColor: 'var(--color-bg, #F8FAFC)',
          fontFamily: 'var(--font-family, Inter), sans-serif' 
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
