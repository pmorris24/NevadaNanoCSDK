// src/components/PromptModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import './PromptModal.css';

interface PromptModalProps {
  onSave: (value: string) => void;
  onClose: () => void;
  title: string;
  initialValue?: string;
  placeholder?: string;
}

const PromptModal: React.FC<PromptModalProps> = ({ onSave, onClose, title, initialValue = '', placeholder }) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (value.trim()) {
      onSave(value.trim());
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="prompt-form" onKeyDown={handleKeyDown}>
      <h3 className="prompt-title">{title}</h3>
      <input
        ref={inputRef}
        type="text"
        className="prompt-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />
      <div className="prompt-actions">
        <button onClick={onClose} className="action-button">Cancel</button>
        <button onClick={handleSave} className="action-button primary">Save</button>
      </div>
    </div>
  );
};

export default PromptModal; 