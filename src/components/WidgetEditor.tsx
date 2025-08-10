// src/components/WidgetEditor.tsx
import React from 'react';
import './WidgetEditor.css';

// FIX: Add 'export' to the type definition
export type GridlineStyle = 'both' | 'y-only' | 'x-only' | 'dots' | 'none';

interface WidgetEditorProps {
  currentStyle: GridlineStyle;
  onStyleChange: (style: GridlineStyle) => void;
}

const WidgetEditor: React.FC<WidgetEditorProps> = ({ currentStyle, onStyleChange }) => {
  const options: { value: GridlineStyle; label: string }[] = [
    { value: 'both', label: 'Standard Grid' },
    { value: 'y-only', label: 'Horizontal Only' },
    { value: 'x-only', label: 'Vertical Only' },
    { value: 'dots', label: 'Dotted Grid' },
    { value: 'none', label: 'No Grid' },
  ];

  return (
    <div className="widget-editor">
      <h4 className="editor-section-title">Chart Background</h4>
      <p className="editor-section-subtitle">Choose a gridline style for the chart background.</p>
      <div className="style-options-container">
        {options.map(opt => (
          <label key={opt.value} className="style-radio-label">
            <input
              type="radio"
              name="gridline-style"
              value={opt.value}
              checked={currentStyle === opt.value}
              onChange={() => onStyleChange(opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default WidgetEditor;