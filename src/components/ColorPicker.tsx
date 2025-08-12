// src/components/ColorPicker.tsx
import React from 'react';
import './ColorPicker.css';

interface ColorPickerProps {
  x: number;
  y: number;
  onSelect: (color: string) => void;
}

const COLORS = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
  '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
  '#FF5722', '#795548', '#9E9E9E', '#607D8B'
];

const ColorPicker: React.FC<ColorPickerProps> = ({ x, y, onSelect }) => {
  return (
    <div className="color-picker" style={{ top: y, left: x }} onClick={e => e.stopPropagation()}>
      {COLORS.map(color => (
        <div
          key={color}
          className="color-swatch"
          style={{ backgroundColor: color }}
          onClick={() => onSelect(color)}
        />
      ))}
    </div>
  );
};

export default ColorPicker;