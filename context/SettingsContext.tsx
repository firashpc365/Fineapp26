
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, AppMode } from '../types';

interface SettingsContextType {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  aiThinkingMode: true,
  autoRecordConfidence: 0.85,
  aiModelPreference: 'flash',
  compactSidebar: false,
  glassIntensity: 'medium',
  themeAccent: 'blue',
  activeWallpaper: '', // Empty string implies "Use Theme Default"
  animationsEnabled: true,
  motionEffects: true,
  autoSync: true,
  // Layer Defaults
  bgOverlayOpacity: 0.7,
  enableTechGrid: true,
  enableNoise: true,
  techGridPosition: 'back',
  
  defaultCurrency: 'SAR',
  enableNotifications: true,
  language: 'en',
  
  // Financial Defaults
  defaultTaxRate: 15,      // VAT 15%
  jagInvoiceFeeRate: 10,   // JAG Fee 10%
  paulInvoiceFeeRate: 5,   // Paul Fee 5%
  paulCommissionRate: 15,
  targetProfitMargin: 20,
};

const ACCENT_MAP = {
  teal: { primary: '#14b8a6', glow: 'rgba(20, 184, 166, 0.5)', text: 'text-teal-400', bg: 'bg-teal-600' },
  blue: { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)', text: 'text-blue-400', bg: 'bg-blue-600' },
  purple: { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.5)', text: 'text-purple-400', bg: 'bg-purple-600' },
  gold: { primary: '#eab308', glow: 'rgba(234, 179, 8, 0.5)', text: 'text-yellow-400', bg: 'bg-yellow-500' },
};

const GLASS_MAP = {
  low: '4px',
  medium: '12px',
  high: '40px'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('elitepro_settings');
    // Merge saved settings with defaults to ensure new fields (like layers) are present if old data exists
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [appMode, setAppMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem('elitepro_app_mode');
    return (saved as AppMode) || AppMode.BUSINESS;
  });

  // Apply Theme Globally via CSS Variables
  useEffect(() => {
    const accent = ACCENT_MAP[settings.themeAccent] || ACCENT_MAP.blue;
    const blur = GLASS_MAP[settings.glassIntensity] || GLASS_MAP.medium;
    
    const root = document.documentElement;
    root.style.setProperty('--accent-primary', accent.primary);
    root.style.setProperty('--accent-glow', accent.glow);
    root.style.setProperty('--glass-blur', blur);

    // Dynamic Style Injection for Tailwind overrides
    let styleTag = document.getElementById('dynamic-theme-overrides');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-theme-overrides';
      document.head.appendChild(styleTag);
    }
    
    styleTag.innerHTML = `
      .theme-accent-text { color: ${accent.primary} !important; }
      .theme-accent-bg { background-color: ${accent.primary} !important; }
      .theme-accent-border { border-color: ${accent.primary} !important; }
      .theme-accent-ring { --tw-ring-color: ${accent.glow} !important; }
      .theme-accent-shadow { box-shadow: 0 0 20px -5px ${accent.glow} !important; }
      .glass-panel-dynamic { backdrop-filter: blur(${blur}) !important; -webkit-backdrop-filter: blur(${blur}) !important; }
      
      /* Global override for specific blue elements to follow accent */
      .bg-blue-600 { background-color: ${accent.primary} !important; }
      .text-blue-400, .text-blue-500 { color: ${accent.primary} !important; }
      .border-blue-500, .border-blue-600 { border-color: ${accent.primary} !important; }
      .shadow-blue-900\\/20 { box-shadow: 0 10px 15px -3px ${accent.glow} !important; }
      
      /* Disable animations if requested */
      ${!settings.animationsEnabled ? '* { transition: none !important; animation: none !important; }' : ''}
    `;

    localStorage.setItem('elitepro_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('elitepro_app_mode', appMode);
  }, [appMode]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, appMode, setAppMode }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
