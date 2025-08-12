// src/ThemeService.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

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
    isEnabled: false, // Default is now false
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
  const [isCrosshairEnabled, setIsCrosshairEnabled] = useState(false); // Default is now false

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from('settings').select('key, value');
      
      if (error) {
        console.error('Error fetching settings:', error);
      } else if (data) {
        const themeSetting = data.find(s => s.key === 'theme');
        if (themeSetting) setThemeState(themeSetting.value as Theme);

        const bentoSetting = data.find(s => s.key === 'magicBentoSettings');
        if (bentoSetting && bentoSetting.value) {
            try {
                const parsedSettings = typeof bentoSetting.value === 'string'
                    ? JSON.parse(bentoSetting.value)
                    : bentoSetting.value;
                setMagicBentoSettingsState(prev => ({ ...prev, ...parsedSettings }));
            } catch (e) {
                console.error("Failed to parse magicBentoSettings:", e);
            }
        }
        
        const crosshairSetting = data.find(s => s.key === 'crosshairEnabled');
        if (crosshairSetting) setIsCrosshairEnabled(crosshairSetting.value === true || crosshairSetting.value === 'true');
      }
    };

    fetchSettings();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    
    await supabase.from('settings').upsert({ key: 'theme', value: newTheme });
  };

  const updateMagicBentoSettings = async (newSettings: Partial<MagicBentoSettings>) => {
    const updatedSettings = { ...magicBentoSettings, ...newSettings };
    setMagicBentoSettingsState(updatedSettings);
    await supabase.from('settings').upsert({ key: 'magicBentoSettings', value: updatedSettings });
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleCrosshair = async () => {
    const newCrosshairState = !isCrosshairEnabled;
    setIsCrosshairEnabled(newCrosshairState);
    await supabase.from('settings').upsert({ key: 'crosshairEnabled', value: newCrosshairState });
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