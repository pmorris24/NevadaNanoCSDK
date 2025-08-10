// src/ThemeService.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Helper functions for cookies
const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};


export type Theme = 'light' | 'dark';

export interface MagicBentoSettings {
  isEnabled: boolean;
  color: string;
  intensity: number;
  textAutoHide: boolean;
  enableStars: boolean;
  enableSpotlight: boolean;
  enableBorderGlow: boolean;
  spotlightRadius: number;
  particleCount: number;
  enableTilt: boolean;
  glowColor: string;
  clickEffect: boolean;
  enableMagnetism: boolean;
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  magicBentoSettings: MagicBentoSettings;
  updateMagicBentoSettings: (settings: Partial<MagicBentoSettings>) => void;
  isCrosshairEnabled: boolean;
  toggleCrosshair: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [magicBentoSettings, setMagicBentoSettingsState] = useState<MagicBentoSettings>({
    isEnabled: true,
    color: '132, 0, 255',
    intensity: 0.4,
    textAutoHide: true,
    enableStars: true,
    enableSpotlight: true,
    enableBorderGlow: true,
    spotlightRadius: 300,
    particleCount: 12,
    enableTilt: true,
    glowColor: '132, 0, 255',
    clickEffect: true,
    enableMagnetism: true,
  });
  const [isCrosshairEnabled, setIsCrosshairEnabled] = useState(true);

  useEffect(() => {
    const themeCookie = getCookie('theme');
    if (themeCookie) {
      setThemeState(themeCookie as Theme);
    }

    const bentoCookie = getCookie('magicBentoSettings');
    if (bentoCookie) {
      try {
        const parsedSettings = JSON.parse(bentoCookie);
        setMagicBentoSettingsState(prev => ({ ...prev, ...parsedSettings }));
      } catch (e) {
        console.error("Failed to parse magicBentoSettings from cookie:", e);
      }
    }
    
    const crosshairCookie = getCookie('crosshairEnabled');
    if (crosshairCookie) {
      setIsCrosshairEnabled(crosshairCookie === 'true');
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    setCookie('theme', newTheme, 365);
  };

  const updateMagicBentoSettings = (newSettings: Partial<MagicBentoSettings>) => {
    const updatedSettings = { ...magicBentoSettings, ...newSettings };
    setMagicBentoSettingsState(updatedSettings);
    setCookie('magicBentoSettings', JSON.stringify(updatedSettings), 365);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleCrosshair = () => {
    const newCrosshairState = !isCrosshairEnabled;
    setIsCrosshairEnabled(newCrosshairState);
    setCookie('crosshairEnabled', String(newCrosshairState), 365);
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, magicBentoSettings, updateMagicBentoSettings, isCrosshairEnabled, toggleCrosshair }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};