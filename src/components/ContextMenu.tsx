// src/components/ContextMenu.tsx
import React from 'react';
import './ContextMenu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  widgetId: string | null;
  isChart: boolean; // Add this line
  onEdit: () => void;
  onEditColors: () => void; // Add this line
  onRemove: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  isChart,
  onEdit,
  onEditColors,
  onRemove,
}) => {
  return (
    <div className="context-menu" style={{ top: y, left: x }}>
      <button onClick={onEdit}>Edit Widget</button>
      {isChart && <button onClick={onEditColors}>Edit Colors</button>}
      <button className="remove-button" onClick={onRemove}>
        Remove Widget
      </button>
    </div>
  );
};

export default ContextMenu;