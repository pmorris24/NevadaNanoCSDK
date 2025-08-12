// src/components/CursorSettings.tsx
import React from 'react';
import './BentoSettingsModal.css'; // Reusing styles for consistency
import { useTheme } from '../ThemeService';

interface CursorSettingsProps {
  onClose: () => void;
}

const CursorSettings: React.FC<CursorSettingsProps> = ({ onClose }) => {
  const { isCrosshairEnabled, toggleCrosshair } = useTheme();

  return (
    <div className="bento-settings-modal" onClick={onClose}>
      <div className="bento-settings-content" onClick={(e) => e.stopPropagation()}>
        <h2>Cursor Settings</h2>
        
        <div className="setting-row">
          <label>Enable Crosshair</label>
          <input 
            type="checkbox" 
            checked={isCrosshairEnabled} 
            onChange={toggleCrosshair}
          />
        </div>

        <div className="bento-settings-actions">
          <button onClick={onClose} className="action-button primary">Done</button>
        </div>
      </div>
    </div>
  );
};

export default CursorSettings;