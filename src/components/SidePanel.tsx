// src/components/SidePanel.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Layout } from 'react-grid-layout';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from 'react-beautiful-dnd';
import './SidePanel.css';
import Modal from './Modal';
import PromptModal from './PromptModal';
import ColorPicker from './ColorPicker';

export interface WidgetInstance {
  instanceId: string;
  id: string;
  layout: Layout;
  title?: string;
  embedCode?: string;
  widgetOid?: string;
  dashboardOid?: string;
  styleConfig?: any;
  series?: { name: string; color: string }[];
  colorConfig?: Record<string, string>;
}

export interface Dashboard {
  id: string;
  name: string;
  folderId?: string | null;
  widgetInstances?: WidgetInstance[];
  theme?: 'light' | 'dark';
  iframeUrl?: string;
  layout?: Layout[];
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
}

export interface SidePanelProps {
  isCollapsed: boolean;
  togglePanel: () => void;
  folders: Folder[];
  dashboards: Dashboard[];
  activeDashboardId: string | null;
  onAddFolder: (name: string) => void;
  onLoadDashboard: (dashboardId: string) => void;
  onUpdateFolder: (id: string, newName: string, newColor?: string) => void;
  onUpdateDashboard: (id: string, newName: string) => void;
  onUpdateDashboardFolder: (
    dashboardId: string,
    folderId: string | null
  ) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteDashboard: (dashboardId: string) => void;
  onAllDashboardsClick: () => void;
  onToggleUsageAnalytics: () => void;
  activeView: 'csdk' | 'data' | 'analytics' | 'admin' | 'usage' | 'pulse' | null;
  showAllDashboards: boolean;
  onOpenInNewWindow: (dashboardId: string) => void;
}

type PromptState = {
  isOpen: boolean;
  mode: 'addFolder' | 'renameDashboard' | null;
  itemId: string | null;
  initialValue?: string;
};

const SidePanel: React.FC<SidePanelProps> = ({
  isCollapsed,
  togglePanel,
  folders,
  dashboards,
  activeDashboardId,
  onAddFolder,
  onLoadDashboard,
  onUpdateFolder,
  onUpdateDashboard,
  onUpdateDashboardFolder,
  onDeleteFolder,
  onDeleteDashboard,
  onAllDashboardsClick,
  onToggleUsageAnalytics,
  activeView,
  showAllDashboards,
  onOpenInNewWindow,
}) => {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    f1: true,
    f2: true,
  });
  const [promptState, setPromptState] = useState<PromptState>({
    isOpen: false,
    mode: null,
    itemId: null,
  });
  const [editingFolder, setEditingFolder] = useState<{
    id: string;
    name: string;
    color: string;
  } | null>(null);
  const [colorPicker, setColorPicker] = useState<{
    visible: boolean;
    x: number;
    y: number;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    itemId: string | null;
    itemType: 'folder' | 'dashboard' | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    itemId: null,
    itemType: null,
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingFolder) {
      editInputRef.current?.focus();
    }
  }, [editingFolder]);

  useEffect(() => {
    if (!showSearchBar) {
      setSearchTerm('');
    }
  }, [showSearchBar]);

  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleContextMenu = (
    event: React.MouseEvent,
    itemId: string,
    itemType: 'folder' | 'dashboard'
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      itemId,
      itemType,
    });
  };

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  const closeColorPicker = useCallback(() => {
    setColorPicker(null);
  }, []);

  useEffect(() => {
    if (contextMenu.visible) {
      window.addEventListener('click', closeContextMenu);
      return () => window.removeEventListener('click', closeContextMenu);
    }
  }, [contextMenu.visible, closeContextMenu]);

  useEffect(() => {
    if (colorPicker?.visible) {
      window.addEventListener('click', closeColorPicker);
      return () => window.removeEventListener('click', closeColorPicker);
    }
  }, [colorPicker, closeColorPicker]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const isDashboard = dashboards.some((d) => d.id === draggableId);

    if (isDashboard) {
      const newFolderId =
        destination.droppableId === 'root-dashboards'
          ? null
          : destination.droppableId;
      onUpdateDashboardFolder(draggableId, newFolderId);
    }
  };

  const handleEditFolder = () => {
    if (!contextMenu.itemId || contextMenu.itemType !== 'folder') return;
    const folder = folders.find((f) => f.id === contextMenu.itemId);
    if (folder) {
      setEditingFolder({
        id: folder.id,
        name: folder.name,
        color: folder.color || '#666',
      });
    }
    closeContextMenu();
  };

  const handleDelete = () => {
    if (!contextMenu.itemId || !contextMenu.itemType) return;

    if (contextMenu.itemType === 'dashboard') {
      onDeleteDashboard(contextMenu.itemId);
    } else if (contextMenu.itemType === 'folder') {
      onDeleteFolder(contextMenu.itemId);
    }

    closeContextMenu();
  };

  const handleSaveEdit = () => {
    if (editingFolder) {
      onUpdateFolder(editingFolder.id, editingFolder.name, editingFolder.color);
      setEditingFolder(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingFolder(null);
  };

  const handlePromptSave = (value: string) => {
    if (!promptState.mode) return;

    if (promptState.mode === 'addFolder') {
      onAddFolder(value);
    } else if (promptState.mode === 'renameDashboard' && promptState.itemId) {
      onUpdateDashboard(promptState.itemId, value);
    }

    setPromptState({ isOpen: false, mode: null, itemId: null });
  };

  const handleColorSelect = (color: string) => {
    if (editingFolder) {
      setEditingFolder({ ...editingFolder, color });
    }
    setColorPicker(null);
  };

  const openColorPicker = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setColorPicker({ visible: true, x: rect.left, y: rect.bottom + 5 });
  };

  const filteredFolders = folders.filter(
    (folder) =>
      folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dashboards.some(
        (d) =>
          d.folderId === folder.id &&
          d.name &&
          d.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const filteredDashboards = dashboards.filter(
    (dashboard) =>
      dashboard.name &&
      dashboard.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dashboardsInRoot = filteredDashboards.filter((d) => !d.folderId);

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <span className="dashboards-title">Dashboards</span>
        <div className="dashboards-icons">
          <i
            className="fas fa-search"
            onClick={() => setShowSearchBar(true)}
          ></i>
          <i className="fas fa-check-square"></i>
          <i
            className="fas fa-plus"
            onClick={() =>
              setPromptState({ isOpen: true, mode: 'addFolder', itemId: null })
            }
          ></i>
        </div>
      </div>
      <div className={`search-bar-area ${showSearchBar ? 'visible' : ''}`}>
        <div className="search-input-container">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search..."
            className="dashboard-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus={showSearchBar}
          />
        </div>
        <button
          className="search-done-icon-button"
          onClick={() => setShowSearchBar(false)}
          aria-label="Done searching"
        >
          <i className="fas fa-check"></i>
        </button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <nav className="sidebar-nav">
          <Droppable droppableId="root-dashboards" type="DASHBOARD">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef}>
                {/* Non-Draggable items */}
                <li
                  className={
                    activeView === 'analytics' &&
                    !activeDashboardId &&
                    !showAllDashboards
                      ? 'active'
                      : ''
                  }
                >
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onAllDashboardsClick();
                    }}
                  >
                    <i className="fas fa-chart-column"></i> <span>All Dashboards</span>
                  </a>
                </li>
                {(!searchTerm ||
                  'usage analytics'.includes(searchTerm.toLowerCase())) && (
                  <li className={activeView === 'usage' ? 'active' : ''}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onToggleUsageAnalytics();
                      }}
                    >
                      <i className="fas fa-sliders-h"></i> <span>Usage Analytics</span>
                    </a>
                  </li>
                )}

                {filteredFolders.map((folder) => (
                  <li
                    key={folder.id}
                    className={`${
                      openFolders[folder.id] || searchTerm ? 'open' : ''
                    } folder-item`}
                  >
                    {editingFolder && editingFolder.id === folder.id ? (
                      <div className="folder-edit-container">
                        <i
                          className="fas fa-folder folder-icon"
                          style={{ color: editingFolder.color }}
                          onClick={openColorPicker}
                        ></i>
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editingFolder.name}
                          onChange={(e) =>
                            setEditingFolder({
                              ...editingFolder,
                              name: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="folder-name-input"
                        />
                        <div className="edit-actions">
                          <i
                            className="fas fa-check save-icon"
                            onClick={handleSaveEdit}
                          ></i>
                          <i
                            className="fas fa-times cancel-icon"
                            onClick={handleCancelEdit}
                          ></i>
                        </div>
                      </div>
                    ) : (
                      <div
                        onContextMenu={(e) =>
                          handleContextMenu(e, folder.id, 'folder')
                        }
                      >
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFolder(folder.id);
                          }}
                        >
                          <i
                            className="fas fa-folder folder-icon"
                            style={{
                              color: folder.color || 'var(--sidebar-icon)',
                            }}
                          ></i>{' '}
                          <span>{folder.name}</span>
                        </a>
                      </div>
                    )}
                    <Droppable droppableId={folder.id} type="DASHBOARD">
                      {(provided) => (
                        <ul
                          className="submenu"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {filteredDashboards
                            .filter((d) => d.folderId === folder.id)
                            .map((dashboard, index) => (
                              <Draggable
                                key={dashboard.id}
                                draggableId={dashboard.id}
                                index={index}
                              >
                                {(provided) => (
                                  <li
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={
                                      dashboard.id === activeDashboardId
                                        ? 'active'
                                        : ''
                                    }
                                    onContextMenu={(e) =>
                                      handleContextMenu(
                                        e,
                                        dashboard.id,
                                        'dashboard'
                                      )
                                    }
                                  >
                                    <a
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        onLoadDashboard(dashboard.id);
                                      }}
                                    >
                                      <i className="fas fa-link"></i>{' '}
                                      <span>{dashboard.name}</span>
                                    </a>
                                  </li>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </ul>
                      )}
                    </Droppable>
                  </li>
                ))}

                {dashboardsInRoot.map((dashboard, index) => (
                  <Draggable
                    key={dashboard.id}
                    draggableId={dashboard.id}
                    index={index}
                  >
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={
                          dashboard.id === activeDashboardId ? 'active' : ''
                        }
                        onContextMenu={(e) =>
                          handleContextMenu(e, dashboard.id, 'dashboard')
                        }
                      >
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            onLoadDashboard(dashboard.id);
                          }}
                        >
                          <i className="fas fa-link"></i> <span>{dashboard.name}</span>
                        </a>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </nav>
      </DragDropContext>
      {contextMenu.visible && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.itemType === 'folder' && (
            <button onClick={handleEditFolder}>Edit Folder</button>
          )}
          {contextMenu.itemType === 'dashboard' && (
            <button
              className="rename-button"
              onClick={() => {
                const dashboard = dashboards.find(
                  (d) => d.id === contextMenu.itemId
                );
                if (dashboard) {
                  setPromptState({
                    isOpen: true,
                    mode: 'renameDashboard',
                    itemId: dashboard.id,
                    initialValue: dashboard.name,
                  });
                }
                closeContextMenu();
              }}
            >
              Rename
            </button>
          )}
          {contextMenu.itemType === 'dashboard' &&
            dashboards.find((d) => d.id === contextMenu.itemId)?.iframeUrl && (
              <button
                onClick={() => {
                  if (contextMenu.itemId) {
                    onOpenInNewWindow(contextMenu.itemId);
                  }
                  closeContextMenu();
                }}
              >
                Open in New Window
              </button>
            )}
          <button className="remove-button" onClick={handleDelete}>
            Delete {contextMenu.itemType}
          </button>
        </div>
      )}
      {promptState.isOpen && (
        <Modal
          onClose={() =>
            setPromptState({ isOpen: false, mode: null, itemId: null })
          }
          title={
            promptState.mode === 'addFolder'
              ? 'Create New Folder'
              : 'Rename Dashboard'
          }
        >
          <PromptModal
            onSave={handlePromptSave}
            onClose={() =>
              setPromptState({ isOpen: false, mode: null, itemId: null })
            }
            title={
              promptState.mode === 'addFolder'
                ? 'Enter folder name'
                : 'Enter new dashboard name'
            }
            initialValue={promptState.initialValue}
            placeholder={
              promptState.mode === 'addFolder' ? 'e.g. Financial Reports' : ''
            }
          />
        </Modal>
      )}
      {colorPicker?.visible && (
        <ColorPicker
          x={colorPicker.x}
          y={colorPicker.y}
          onSelect={handleColorSelect}
        />
      )}
      <button
        onClick={togglePanel}
        className="sidebar-toggle-button"
        aria-label="Toggle sidebar"
      >
        <i
          className={`fas ${
            isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'
          }`}
        ></i>
      </button>
    </div>
  );
};

export default React.memo(SidePanel);