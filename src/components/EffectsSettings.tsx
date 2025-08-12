// src/components/EffectsSettings.tsx
import React from 'react';
import './BentoSettingsModal.css';
import { useTheme } from '../ThemeService';
import { debounce } from 'lodash';

interface EffectsSettingsProps {
  onClose: () => void;
}

const EffectsSettings: React.FC<EffectsSettingsProps> = ({ onClose }) => {
  const { magicBentoSettings, updateMagicBentoSettings } = useTheme();

  const handleSettingChange = (key: string, value: any) => {
    updateMagicBentoSettings({ [key]: value });
  };
  
  const debouncedUpdate = debounce(handleSettingChange, 200);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    handleSettingChange('glowColor', `${r}, ${g}, ${b}`);
  };

  const colorToHex = (rgbColor: string) => {
    if (!rgbColor) return '#000000';
    const parts = rgbColor.split(',').map(s => parseInt(s.trim(), 10));
    if (parts.length !== 3 || parts.some(isNaN)) return '#000000';
    const [r, g, b] = parts;
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const renderToggle = (label: string, key: keyof typeof magicBentoSettings) => (
    <div className="setting-row">
      <label>{label}</label>
      <input 
        type="checkbox" 
        checked={!!magicBentoSettings[key]} 
        onChange={(e) => handleSettingChange(key, e.target.checked)} 
      />
    </div>
  );

  const renderSlider = (label: string, key: keyof typeof magicBentoSettings, min: number, max: number, step: number) => (
    <div className="setting-row">
      <label htmlFor={key}>{label}</label>
      <div className="slider-container">
        <input 
          type="range" 
          id={key}
          min={min} 
          max={max} 
          step={step} 
          value={magicBentoSettings[key] as number || 0} 
          onChange={(e) => debouncedUpdate(key, parseFloat(e.target.value))} 
        />
        <span>{(magicBentoSettings[key] as number || 0).toFixed(key === 'intensity' ? 1 : 0)}</span>
      </div>
    </div>
  );

  return (
    <div className="bento-settings-modal" onClick={onClose}>
      <div className="bento-settings-content" onClick={(e) => e.stopPropagation()}>
        <h2>Effect Settings</h2>
        
        {renderToggle("Enable Bento Glow", "isEnabled")}
        
        <div className="setting-row">
          <label htmlFor="glowColor">Glow Color</label>
          <input 
            type="color" 
            id="glowColor"
            value={colorToHex(magicBentoSettings.glowColor)}
            onChange={handleColorChange}
          />
        </div>

        {renderSlider("Glow Intensity", "intensity", 0.1, 10, 0.1)}
        {renderToggle("Text Auto Hide", "textAutoHide")}
        {renderToggle("Enable Stars", "enableStars")}
        {renderToggle("Enable Spotlight", "enableSpotlight")}
        {renderToggle("Enable Border Glow", "enableBorderGlow")}
        {renderSlider("Spotlight Radius", "spotlightRadius", 100, 1000, 10)}
        {renderSlider("Particle Count", "particleCount", 0, 50, 1)}
        {renderToggle("Enable Tilt", "enableTilt")}
        {renderToggle("Enable Click Effect", "clickEffect")}
      </div>
    </div>
  );
};

export default EffectsSettings;