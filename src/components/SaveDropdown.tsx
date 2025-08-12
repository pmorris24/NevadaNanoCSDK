// src/components/SaveDropdown.tsx
import React from 'react';
import './SaveDropdown.css';

interface SaveDropdownProps {
  onSave: () => void;
  onSaveAs: () => void;
  isSaveDisabled: boolean;
}

const SaveDropdown: React.FC<SaveDropdownProps> = ({ onSave, onSaveAs, isSaveDisabled }) => {
  return (
    <div className="save-dropdown-menu">
      <button onClick={onSave} disabled={isSaveDisabled} title={isSaveDisabled ? "Save a new dashboard first" : "Save current dashboard"}>
        <i className="fas fa-save"></i> Save
      </button>
      <button onClick={onSaveAs}>
        <i className="fas fa-copy"></i> Save As...
      </button>
    </div>
  );
};

export default SaveDropdown;