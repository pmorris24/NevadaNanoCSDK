// src/components/DockSettings.tsx
import React from 'react';
import './DockSettings.css';

interface DockSettingsProps {
  settings: {
    panelHeight: number;
    baseItemSize: number;
    magnification: number;
    widgetPadding: number;
  };
  onSettingsChange: (newSettings: {
    panelHeight: number;
    baseItemSize: number;
    magnification: number;
    widgetPadding: number;
  }) => void;
  onClose: () => void;
}

const DockSettings: React.FC<DockSettingsProps> = ({ settings, onSettingsChange, onClose }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({
      ...settings,
      [e.target.name]: Number(e.target.value),
    });
  };

  return (
    <div className="dock-settings-overlay" onClick={onClose}>
        <div className="dock-settings-panel" onClick={(e) => e.stopPropagation()}>
        <h3>Customize Dock</h3>
        <div className="slider-group">
            <label>Background Height</label>
            <div className="slider-wrapper">
            <input
                type="range"
                name="panelHeight"
                min="40"
                max="100"
                value={settings.panelHeight}
                onChange={handleChange}
            />
            <span>{settings.panelHeight}</span>
            </div>
        </div>
        <div className="slider-group">
            <label>Item Size</label>
            <div className="slider-wrapper">
            <input
                type="range"
                name="baseItemSize"
                min="30"
                max="80"
                value={settings.baseItemSize}
                onChange={handleChange}
            />
            <span>{settings.baseItemSize}</span>
            </div>
        </div>
        <div className="slider-group">
            <label>Magnification</label>
            <div className="slider-wrapper">
            <input
                type="range"
                name="magnification"
                min="50"
                max="150"
                value={settings.magnification}
                onChange={handleChange}
            />
            <span>{settings.magnification}</span>
            </div>
        </div>
        <div className="slider-group">
            <label>Widget Padding</label>
            <div className="slider-wrapper">
            <input
                type="range"
                name="widgetPadding"
                min="0"
                max="50"
                value={settings.widgetPadding}
                onChange={handleChange}
            />
            <span>{settings.widgetPadding}</span>
            </div>
        </div>
        </div>
    </div>
  );
};

export default DockSettings;