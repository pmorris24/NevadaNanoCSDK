// src/components/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import UserMenu from './UserMenu';

interface HeaderProps {
    isEditable: boolean;
    toggleEditMode: () => void;
    onNewDashboard: () => void;
    onAddEmbed: () => void;
    themeMode: 'light' | 'dark';
    onToggleAnalytics: () => void;
    onToggleAdmin: () => void;
    onToggleData: () => void;
    onTogglePulse: () => void;
    onProfileClick: () => void;
    onToggleCSDK: () => void;
    activeView: 'csdk' | 'data' | 'analytics' | 'admin' | 'usage' | 'pulse' | null;
}

const Header: React.FC<HeaderProps> = ({ isEditable, toggleEditMode, onNewDashboard, onAddEmbed, themeMode, onToggleAnalytics, onToggleAdmin, onToggleData, onTogglePulse, onProfileClick, onToggleCSDK, activeView }) => {
    const [isUserMenuVisible, setUserMenuVisible] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const toggleUserMenu = () => {
        setUserMenuVisible(prev => !prev);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
            setUserMenuVisible(false);
        }
    };

    useEffect(() => {
        if (isUserMenuVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserMenuVisible]);
    
    return (
        <header className="sisense-header">
            <div className="header-left">
                <div className="logo">
                    <img 
                        src={themeMode === 'dark' ? '/sisense-logo-white.png' : '/sisense-logo-black.png'} 
                        alt="Sisense Logo" 
                        height="40" 
                    />
                </div>
            </div>
            <nav className="header-nav">
                <a href="#" className={activeView === 'data' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onToggleData(); }}>Data</a>
                <a href="#" className={activeView === 'analytics' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onToggleAnalytics(); }}>Analytics</a>
                <a href="#" className={activeView === 'csdk' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onToggleCSDK(); }}>CSDK</a>
                <a href="#" className={activeView === 'pulse' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onTogglePulse(); }}>Pulse</a>
                <a href="#" className={activeView === 'admin' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onToggleAdmin(); }}>Admin</a>
            </nav>
            <div className="header-right">
                <div className="header-icons">
                    <i className="fas fa-search"></i>
                    <i className="fas fa-bell"></i>
                    <i className="fas fa-th" onClick={onNewDashboard} title="New Dashboard"></i>
                    <i className="fas fa-plus" onClick={onAddEmbed} title="Embed Content"></i>
                    <i 
                        className={`fas fa-pencil-alt ${isEditable ? 'active' : ''}`} 
                        onClick={toggleEditMode}
                        title={isEditable ? 'Done Editing' : 'Edit Dashboard'}
                    ></i>
                    <div ref={userMenuRef} style={{position: 'relative'}}>
                        <i className="fas fa-user" onClick={toggleUserMenu}></i>
                        {isUserMenuVisible && <UserMenu onProfileClick={() => { onProfileClick(); setUserMenuVisible(false); }} onSignOutClick={() => {}} />}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;