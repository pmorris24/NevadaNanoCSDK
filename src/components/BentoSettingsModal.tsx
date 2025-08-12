// src/components/BentoSettingsModal.tsx
import React, { useState } from 'react';
import './BentoSettingsModal.css';

interface BentoSettingsModalProps {
  initialSettings: {
    isEnabled: boolean;
    color: string;
    intensity: number;
  };
  onSave: (settings: { isEnabled: boolean; color: string; intensity: number }) => void;
  onClose: () => void;
}

const BentoSettingsModal: React.FC<BentoSettingsModalProps> = ({ initialSettings, onSave, onClose }) => {
  const [isEnabled, setIsEnabled] = useState(initialSettings.isEnabled);
  const [color, setColor] = useState(initialSettings.color);
  const [intensity, setIntensity] = useState(initialSettings.intensity);

  const handleSave = () => {
    onSave({ isEnabled, color, intensity });
    onClose();
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    setColor(`${r}, ${g}, ${b}`);
  };

  const colorToHex = (rgbColor: string) => {
    if (!rgbColor) return '#000000';
    const parts = rgbColor.split(',').map(Number);
    if (parts.length !== 3) return '#000000';
    const [r, g, b] = parts;
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  return (
    <div className="bento-settings-modal" onClick={onClose}>
      <div className="bento-settings-content" onClick={(e) => e.stopPropagation()}>
        <h2>Magic Bento Settings</h2>
        
        <div className="setting-row">
          <label>Enable Effect</label>
          <input 
            type="checkbox" 
            checked={isEnabled} 
            onChange={(e) => setIsEnabled(e.target.checked)} 
          />
        </div>

        <div className="setting-row">
          <label htmlFor="glowColor">Glow Color</label>
          <input 
            type="color" 
            id="glowColor"
            value={colorToHex(color)}
            onChange={handleColorChange}
          />
        </div>

        <div className="setting-row">
          <label htmlFor="glowIntensity">Glow Intensity</label>
          <div className="slider-container">
            <input 
              type="range" 
              id="glowIntensity"
              min="0.1" 
              max="10" 
              step="0.2" 
              value={intensity} 
              onChange={(e) => setIntensity(parseFloat(e.target.value))} 
            />
            <span>{intensity.toFixed(1)}</span>
          </div>
        </div>

        <div className="bento-settings-actions">
          <button onClick={onClose} className="action-button">Cancel</button>
          <button onClick={handleSave} className="action-button primary">Save</button>
        </div>
      </div>
    </div>
  );
};

export default BentoSettingsModal;