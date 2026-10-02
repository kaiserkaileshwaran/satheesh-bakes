import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeSettings } from '../types';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  settings: ThemeSettings;
  themeSettings: ThemeSettings;
  updateThemeSettings: (updated: Partial<ThemeSettings>) => void;
  updateTheme: (updated: Partial<ThemeSettings>) => void;
}

const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  primaryColor: '#6F4E37',
  secondaryColor: '#FFF8F0',
  accentColor: '#D4A017',
  fontFamily: 'Inter',
  darkModeBanner: true,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme] = useState<'light'>(() => 'light');

  const [settings, setSettings] = useState<ThemeSettings>(() => DEFAULT_THEME_SETTINGS);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const toggleTheme = () => {
    return;
  };

  const updateThemeSettings = (updated: Partial<ThemeSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, settings, themeSettings: settings, updateThemeSettings, updateTheme: updateThemeSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
