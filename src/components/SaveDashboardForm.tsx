// src/components/SaveDashboardForm.tsx
import React, { useState } from 'react';
import { type Folder } from './SidePanel';
import './SaveDashboardForm.css';

const SaveDashboardForm: React.FC<{
    folders: Folder[],
    onSave: (folderId: string, name: string) => void
}> = ({ folders, onSave }) => {
    const [name, setName] = useState('');
    const [folderId, setFolderId] = useState(folders[0]?.id || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && folderId) {
            onSave(folderId, name.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="save-dashboard-form">
            <label>
                View Name:
                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </label>
            <label>
                Folder:
                <select value={folderId} onChange={e => setFolderId(e.target.value)} required>
                    {folders.map(folder => (
                        <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                </select>
            </label>
            <button type="submit" className="action-button">Save</button>
        </form>
    );
};

export default SaveDashboardForm;