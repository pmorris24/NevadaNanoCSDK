import React, { useState } from 'react';
import { SketchPicker, ColorResult } from 'react-color';
import './BackdropSettings.css';

interface BackdropSettingsProps {
  onClose: () => void;
  onBackdropChange: (backdrop: any) => void;
}

const BackdropSettings: React.FC<BackdropSettingsProps> = ({ onClose, onBackdropChange }) => {
  const [backdropType, setBackdropType] = useState('none');
  const [color, setColor] = useState('#ffffff');

  const handleColorChangeComplete = (colorResult: ColorResult) => {
    setColor(colorResult.hex);
    onBackdropChange({ type: 'color', value: colorResult.hex });
    onClose(); // Close the modal after a color is selected
  };

  const handleColorChange = (colorResult: ColorResult) => {
    // Live update the color without closing
    setColor(colorResult.hex);
    onBackdropChange({ type: 'color', value: colorResult.hex });
  };

  const handleBackdropTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBackdropType = e.target.value;
    setBackdropType(newBackdropType);
    if (newBackdropType === 'none') {
      onBackdropChange({ type: 'none' });
      onClose(); // Close immediately for 'None'
    } else if (newBackdropType === 'magnet-lines') {
      onBackdropChange({ type: 'magnet-lines' });
      onClose(); // Close immediately for 'Magnet Lines'
    }
  };

  return (
    <div className="backdrop-settings-overlay" onClick={onClose}>
      <div className="backdrop-settings-panel" onClick={(e) => e.stopPropagation()}>
        <h3>Backdrops</h3>
        <div className="backdrop-options">
          <label>
            <input 
              type="radio" 
              name="backdrop" 
              value="none" 
              checked={backdropType === 'none'} 
              onChange={handleBackdropTypeChange} 
            />
            None
          </label>
          <label>
            <input 
              type="radio" 
              name="backdrop" 
              value="color" 
              checked={backdropType === 'color'} 
              onChange={handleBackdropTypeChange} 
            />
            Solid Color
          </label>
          <label>
            <input 
              type="radio" 
              name="backdrop" 
              value="magnet-lines" 
              checked={backdropType === 'magnet-lines'} 
              onChange={handleBackdropTypeChange} 
            />
            Magnet Lines
          </label>
        </div>

        {backdropType === 'color' && (
          <div className="color-picker-container">
            <SketchPicker color={color} onChange={handleColorChange} onChangeComplete={handleColorChangeComplete} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BackdropSettings;