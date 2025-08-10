// src/components/ThemeToggleButton.tsx
import React from 'react';
import './ThemeToggleButton.css';

interface ThemeToggleButtonProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ theme, toggleTheme }) => {
  const isChecked = theme === 'light';
  
  const darkLabel = "color mode toggle, dark mode";
  const lightLabel = "color mode toggle, light mode";
  const ariaLabel = theme === 'dark' ? darkLabel : lightLabel;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.code === "Enter") {
      toggleTheme();
    }
  };

  return (
    <div className="container--toggle" title="color mode toggle">
      <input
        role="switch"
        aria-checked={theme === 'dark'}
        onKeyDown={handleKeyPress}
        type="checkbox"
        id="toggle"
        className="toggle--checkbox"
        onClick={toggleTheme}
        checked={isChecked}
        readOnly
      />
      <label htmlFor="toggle" className="toggle--label" aria-label={ariaLabel}>
          {/* Stars for dark mode */}
          <div className="star star-1"></div>
          <div className="star star-2"></div>
          <div className="star star-3"></div>
          <div className="star star-4"></div>
          <div className="star star-5"></div>
          
          {/* Clouds for light mode */}
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
      </label>
    </div>
  );
};

export default ThemeToggleButton;