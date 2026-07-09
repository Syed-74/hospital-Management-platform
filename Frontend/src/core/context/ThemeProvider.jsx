import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

// Utility to convert hex to space-separated RGB for Tailwind opacity support
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
  borderRadius: '8px',
  showHospitalLogo: true,
  showHospitalName: true,
  enableAnimations: true
};

export const ThemeProvider = ({ children }) => {
  const { user, getHospitalTheme, token } = useAuth();
  const [theme, setTheme] = useState(THEME_INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    
    // Helper to inject both hex (for standard usage if needed) and RGB (for Tailwind)
    const setProp = (name, hexValue) => {
      if (hexValue) {
        root.style.setProperty(`--color-${name}`, hexValue);
        root.style.setProperty(`--color-${name}-rgb`, hexToRgb(hexValue));
      }
    };

    const applyThemeToDOM = (t) => {
      // Colors
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
      
      // Typography
      if (t.fontFamily) root.style.setProperty('--font-family', t.fontFamily);
      
      // UI
      if (t.borderRadius) root.style.setProperty('--border-radius', t.borderRadius);
    };

    const fetchAndApplyTheme = async () => {
      // Only fetch theme if user belongs to a hospital
      if (user?.hospitalId && token) {
        setIsLoading(true);
        const result = await getHospitalTheme(user.hospitalId);
        
        const t = (result.success && result.data) 
          ? { ...THEME_INITIAL_STATE, ...result.data }
          : THEME_INITIAL_STATE;
        
        setTheme(t);
        applyThemeToDOM(t);
        setIsLoading(false);
      } else {
        // Always ensure defaults are applied if no fetch happens
        applyThemeToDOM(THEME_INITIAL_STATE);
        setIsLoading(false);
      }
    };

    fetchAndApplyTheme();
  }, [user?.hospitalId, token]);

  return (
    <ThemeContext.Provider value={{ theme, isLoading }}>
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
