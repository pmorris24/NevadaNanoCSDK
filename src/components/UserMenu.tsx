// src/components/UserMenu.tsx
import React from 'react';
import './UserMenu.css';

interface UserMenuProps {
  onProfileClick: () => void;
  onSignOutClick: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onProfileClick, onSignOutClick }) => {
  return (
    <div className="user-menu-popoverContainer">
      <div className="user-info-section">
        <div className="user-avatar">PA</div>
        <div className="user-details">
          <span>Hi, patrick.morris</span>
          <span>patrick.morris@sis...</span>
        </div>
      </div>
      <div className="menu-section">
        <div className="menu-item" onClick={onProfileClick}>
          My Profile
        </div>
        <div className="menu-item" onClick={onSignOutClick}>
          Sign Out
        </div>
      </div>
      <div className="footer-section">
        <span>Powered By Sisense</span>
        <span>Version: L2025.2.0.496</span>
      </div>
    </div>
  );
};

export default UserMenu; 