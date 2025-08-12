// src/App.tsx
import React, { useState, useCallback, useEffect, FC, useRef } from 'react';
import { Responsive, WidthProvider, type Layout } from 'react-grid-layout';
import {
  DashboardWidget,
  SisenseContextProvider,
  ThemeProvider,
  type DashboardWidgetStyleOptions,
} from '@sisense/sdk-ui';
import Highcharts from 'highcharts';
import { getHighchartsThemeOptions } from './theme';
import { FaPalette, FaCrosshairs, FaGear, FaTableCellsLarge } from 'react-icons/fa6';

import ThemeToggleButton from './components/ThemeToggleButton';
import Header from './components/Header';
import SidePanel, {
  type Folder,
  type Dashboard,
  type WidgetInstance,
} from './components/SidePanel';
import Modal from './components/Modal';
import WidgetLibrary from './components/WidgetLibrary';
import SaveDashboardForm from './components/SaveDashboardForm';
import ContextMenu from './components/ContextMenu';
import WidgetEditor, { type GridlineStyle } from './components/WidgetEditor';
import EmbedModal, { type EmbedModalSaveData } from './components/EmbedModal';
import CodeBlock from './components/CodeBlock';
import SaveDropdown from './components/SaveDropdown';
import { StyleConfig } from './components/widgetstyler';
import { useTheme } from './ThemeService';
import { supabase } from './supabaseClient';
import ChartColorStyler from './components/ChartColorStyler';
import { useMagicBento } from './hooks/useMagicBento';
import EffectsSettings from './components/EffectsSettings';
import CursorSettings from './components/CursorSettings';
import Crosshair from './components/Crosshair';
import Dock from './components/Dock';
import DockSettings from './components/DockSettings';
import BackdropSettings from './components/BackdropSettings';
import MagnetLines from './components/MagnetLines';
import './components/MagicBento.css';
// import ConditionalColorFilterWidget from './components/ConditionalColorFilterWidget.tsx'; // <-- IMPORT TEMPORARILY REMOVED

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- SISENSE THEME DEFINITIONS ---
const lightTheme = {
  chart: { backgroundColor: 'transparent' },
};

const darkTheme = {
  table: {
    header: {
      backgroundColor: '#3c3c3e',
      textColor: '#ffffff',
      borderColor: '#444446',
    },
    cell: {
      backgroundColor: '#2c2c2e',
      textColor: '#ffffff',
      borderColor: '#444446',
    },
    alternatingRows: {
      backgroundColor: '#3a3a3c',
      textColor: '#ffffff',
    },
  },
  pivot: {
    header: {
      backgroundColor: '#3c3c3e',
      textColor: '#ffffff',
      borderColor: '#444446',
    },
    rowHeader: {
      backgroundColor: '#2c2c2e',
      textColor: '#ffffff',
      borderColor: '#444446',
    },
    cell: {
      backgroundColor: '#2c2c2e',
      textColor: '#ffffff',
      borderColor: '#444446',
    },
    alternatingRows: {
      backgroundColor: '#3a3a3c',
      textColor: '#ffffff',
    },
  },
  chart: {
    backgroundColor: 'transparent',
    plotBorderColor: '#606063',
    textColor: '#E0E0E3',
  },
  palette: {
    variantColors: ['#f32958', '#fdd459', '#26b26f', '#4486f8'],
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    primaryTextColor: '#FFFFFF',
    secondaryTextColor: '#8E8E93',
  },
};

const getStyleOptions = (
  themeMode: 'light' | 'dark'
): DashboardWidgetStyleOptions => {
  const isDarkMode = themeMode === 'dark';
  return {
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    border: false,
    shadow: 'None',
    header: {
      backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
      titleTextColor: isDarkMode ? '#FFFFFF' : '#111827',
      dividerLine: true,
      dividerLineColor: isDarkMode ? 'transparent' : '#E5E7EB',
    },
  };
};

const getStyleOptionsFromConfig = (
  styleConfig: StyleConfig
): DashboardWidgetStyleOptions => {
  return {
    backgroundColor: styleConfig.backgroundColor,
    border: styleConfig.border,
    borderColor: styleConfig.borderColor,
    cornerRadius: styleConfig.cornerRadius,
    shadow: styleConfig.shadow,
    spaceAround: styleConfig.spaceAround,
    header: {
      backgroundColor: styleConfig.headerBackgroundColor,
      dividerLine: styleConfig.headerDividerLine,
      dividerLineColor: styleConfig.headerDividerLineColor,
      hidden: styleConfig.headerHidden,
      titleAlignment: styleConfig.headerTitleAlignment,
      titleTextColor: styleConfig.headerTitleTextColor,
    },
  };
};

// --- MAIN APP COMPONENT ---
const App: FC = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const {
    theme,
    toggleTheme,
    setTheme,
    magicBentoSettings,
    isCrosshairEnabled,
  } = useTheme();
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [showAllDashboards, setShowAllDashboards] = useState(false);

  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(
    null
  );
  const [isEditable, setIsEditable] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<
    'csdk' | 'data' | 'analytics' | 'admin' | 'usage' | 'pulse' | null
  >('csdk');
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState<{
    open: boolean;
    instanceId?: string;
  }>({ open: false });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleValue, setEditingTitleValue] = useState('');
  const [isSaveDropdownOpen, setIsSaveDropdownOpen] = useState(false);
  const saveDropdownRef = useRef<HTMLDivElement>(null);
  const [isCreatingNewDashboard, setIsCreatingNewDashboard] = useState(false);
  const [isColorEditorOpen, setColorEditorOpen] = useState(false);
  const [isEffectsSettingsOpen, setEffectsSettingsOpen] = useState(false);
  const [isCursorSettingsOpen, setCursorSettingsOpen] = useState(false);
  const [isDockSettingsOpen, setIsDockSettingsOpen] = useState(false);
  const [isBackdropSettingsOpen, setIsBackdropSettingsOpen] = useState(false);
  const [backdrop, setBackdrop] = useState<any>({ type: 'none' });
  const [dockSettings, setDockSettings] = useState({
    panelHeight: 68,
    baseItemSize: 50,
    magnification: 70,
    widgetPadding: 10,
  });

  const [widgetInstances, setWidgetInstances] = useState<WidgetInstance[]>([]);
  const [isLibraryOpen, setLibraryOpen] = useState(false);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseInGrid, setIsMouseInGrid] = useState(false);

  const widgets = widgetInstances;

  const layouts = { lg: widgetInstances.map((inst) => inst.layout) };

  const forwardedRef = useRef<HTMLDivElement>(null);

  useMagicBento(forwardedRef, magicBentoSettings, isEditable, layouts, mousePosition);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: foldersData, error: foldersError } = await supabase.from('folders').select('*');
      if (foldersError) console.error('Error fetching folders:', foldersError);
      else setFolders(foldersData || []);

      const { data: dashboardsData, error: dashboardsError } = await supabase.from('dashboards').select('*');
      if (dashboardsError) console.error('Error fetching dashboards:', dashboardsError);
      else setDashboards(dashboardsData || []);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const currentDashboard = dashboards.find((d) => d.id === activeDashboardId);
    if (currentDashboard) {
      setWidgetInstances(currentDashboard.widgetInstances || []);
    } else {
      setWidgetInstances([]);
    }
  }, [activeDashboardId, dashboards]);

  const applyTheming = useCallback(
    (
      options: any,
      gridLineStyle: GridlineStyle
    ) => {
      const themeOptions = getHighchartsThemeOptions(theme);

      const animationOptions = {
        chart: { animation: false },
        plotOptions: { series: { animation: false } },
      };

      const mergedOptions = Highcharts.merge(
        options,
        themeOptions,
        animationOptions
      );

      const gridColor = theme === 'dark' ? '#444446' : '#EAEBEF';

      if (mergedOptions.chart) {
        mergedOptions.chart.plotBackgroundImage = undefined;
        mergedOptions.chart.plotBackgroundColor = undefined;
      }

      const setAxisGridLines = (
        axis: any,
        width: number,
        dashStyle: 'Solid' | 'Dot' = 'Solid'
      ) => {
        if (!axis) return;
        const style = {
          gridLineWidth: width,
          gridLineColor: gridColor,
          gridLineDashStyle: dashStyle,
        };
        if (Array.isArray(axis)) {
          axis.forEach((a) => Object.assign(a, style));
        } else {
          Object.assign(axis, style);
        }
      };

      switch (gridLineStyle) {
        case 'both':
          setAxisGridLines(mergedOptions.xAxis, 1);
          setAxisGridLines(mergedOptions.yAxis, 1);
          break;
        case 'y-only':
          setAxisGridLines(mergedOptions.xAxis, 0);
          setAxisGridLines(mergedOptions.yAxis, 1);
          break;
        case 'x-only':
          setAxisGridLines(mergedOptions.xAxis, 1);
          setAxisGridLines(mergedOptions.yAxis, 0);
          break;
        case 'dots':
          setAxisGridLines(mergedOptions.xAxis, 2, 'Dot');
          setAxisGridLines(mergedOptions.yAxis, 2, 'Dot');
          break;
        case 'none':
          setAxisGridLines(mergedOptions.xAxis, 0);
          setAxisGridLines(mergedOptions.yAxis, 0);
          break;
      }

      if (mergedOptions.chart) {
        mergedOptions.chart.backgroundColor = 'transparent';
      } else {
        mergedOptions.chart = { backgroundColor: 'transparent' };
      }

      return mergedOptions;
    },
    [theme]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        saveDropdownRef.current &&
        !saveDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSaveDropdownOpen(false);
      }
    };
    if (isSaveDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSaveDropdownOpen]);

  const togglePanel = () => {
    setIsPanelCollapsed(!isPanelCollapsed);
  };

  const toggleEditMode = () => {
    setIsEditable((prev: boolean) => !prev);
  };

  const showIframeView = (
    url: string,
    view: 'data' | 'analytics' | 'admin' | 'usage' | 'pulse' | null
  ) => {
    setIframeUrl(url);
    setShowAllDashboards(false);
    setActiveView(view);
  };

  const showDashboardView = () => {
    setIframeUrl(null);
    setActiveView('csdk');
  };

  const onLayoutChange = useCallback((newLayout: Layout[]) => {
    setWidgetInstances((prevInstances) => {
      const instanceMap = new Map(
        prevInstances.map((inst) => [inst.instanceId, inst])
      );
      return newLayout
        .map((layoutItem) => {
          const instance = instanceMap.get(layoutItem.i);
          if (instance) {
            return { ...instance, layout: layoutItem };
          }
          return null;
        })
        .filter((instance): instance is WidgetInstance => instance !== null);
    });
  }, []);

  const onResizeStop = useCallback(
    (_: Layout[], __: Layout, newItem: Layout) => {
      setWidgetInstances((prev) =>
        prev.map((inst) =>
          inst.instanceId === newItem.i ? { ...inst, layout: newItem } : inst
        )
      );
      setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
    },
    []
  );

  const addWidget = (widgetConfig: any) => {
    const instanceId = `${widgetConfig.id}-${Date.now()}`;
    const newWidgetInstance: WidgetInstance = {
      instanceId,
      id: widgetConfig.id,
      layout: {
        i: instanceId,
        x: (widgets.length * 3) % 12,
        y: Infinity,
        ...widgetConfig.defaultLayout,
      },
    };
    setWidgetInstances((prev) => [...prev, newWidgetInstance]);
    setLibraryOpen(false);
  };

  const removeWidget = (widgetInstanceId: string) => {
    setWidgetInstances((prev) =>
      prev.filter((inst) => inst.instanceId !== widgetInstanceId)
    );
  };

  const handleUpdateWidgetStyle = (style: GridlineStyle) => {
    if (!editingWidgetId) return;
    setWidgetInstances((prev) =>
      prev.map((inst) => {
        if (inst.instanceId === editingWidgetId) {
          return {
            ...inst,
            styleConfig: { ...inst.styleConfig, gridLineStyle: style },
          };
        }
        return inst;
      })
    );
  };

  const handleUpdateWidgetColor = (seriesName: string, newColor: string) => {
    if (!editingWidgetId) return;
    setWidgetInstances((prev) =>
      prev.map((inst) => {
        if (inst.instanceId === editingWidgetId) {
          const newColorConfig = {
            ...(inst.colorConfig || {}),
            [seriesName]: newColor,
          };
          const newSeries = inst.series?.map((s) =>
            s.name === seriesName ? { ...s, color: newColor } : s
          );
          return { ...inst, colorConfig: newColorConfig, series: newSeries };
        }
        return inst;
      })
    );
  };

  const openEditorForWidget = (widgetId: string) => {
    const widget = widgets.find((w) => w.instanceId === widgetId);
    if (widget) {
      if (widget.id === 'styled-embed' || widget.id === 'embed') {
        setIsEmbedModalOpen({ open: true, instanceId: widget.instanceId });
      } else {
        setEditingWidgetId(widgetId);
        setEditorOpen(true);
      }
    }
  };

  const handleAddFolder = async (name: string) => {
    const newFolder = { name, id: `f-${Date.now()}` };
    const { error } = await supabase.from('folders').insert(newFolder);
    if (error) console.error('Error adding folder:', error);
    else setFolders(prev => [...prev, newFolder]);
  };

  const handleUpdateFolder = async (id: string, newName: string, newColor?: string) => {
    const { error } = await supabase.from('folders').update({ name: newName, color: newColor }).eq('id', id);
    if (error) console.error('Error updating folder:', error);
    else setFolders(prev => prev.map(f => f.id === id ? { ...f, name: newName, color: newColor } : f));
  };

  const handleUpdateDashboard = async (id: string, newName: string) => {
    const { error } = await supabase.from('dashboards').update({ name: newName }).eq('id', id);
    if (error) console.error('Error updating dashboard:', error);
    else setDashboards(prev => prev.map(d => d.id === id ? { ...d, name: newName } : d));
  };

  const handleDeleteFolder = async (id: string) => {
    const { error: dashboardsError } = await supabase.from('dashboards').delete().eq('folderId', id);
    if (dashboardsError) console.error('Error deleting dashboards in folder:', dashboardsError);

    const { error: folderError } = await supabase.from('folders').delete().eq('id', id);
    if (folderError) console.error('Error deleting folder:', folderError);
    else {
      setFolders(prev => prev.filter(f => f.id !== id));
      setDashboards(prev => prev.filter(d => d.folderId !== id));
    }
  };

  const handleSaveDashboard = async (folderId: string, name: string) => {
    const newDashboard: Dashboard = {
      id: `d-${Date.now()}`,
      name,
      folderId,
      widgetInstances,
      theme,
    };
    const { error } = await supabase.from('dashboards').insert(newDashboard);
    if (error) console.error('Error saving dashboard:', error);
    else {
      setDashboards((prev) => [...prev, newDashboard]);
      setActiveDashboardId(newDashboard.id);
      setSaveModalOpen(false);
      setIsCreatingNewDashboard(false);
    }
  };

  const handleSaveDashboardUpdate = async () => {
    if (!activeDashboardId) return;

    const dashboardToUpdate = dashboards.find(d => d.id === activeDashboardId);
    if (dashboardToUpdate) {
      const updatedDashboard = { ...dashboardToUpdate, widgetInstances, theme };
      const { error } = await supabase.from('dashboards').update(updatedDashboard).eq('id', activeDashboardId);

      if (error) console.error('Error updating dashboard:', error);
      else {
        setDashboards(prev => prev.map(d => d.id === activeDashboardId ? updatedDashboard : d));
        setIsSaveDropdownOpen(false);
      }
    }
  };

  const handleLoadDashboard = (dashboardId: string) => {
    setActiveDashboardId(dashboardId);
    const dashboard = dashboards.find((d) => d.id === dashboardId);
    if (dashboard) {
      if (dashboard.theme) {
        setTheme(dashboard.theme);
      }
      if (dashboard.iframeUrl) {
        const url = new URL(dashboard.iframeUrl, sisenseUrl).toString();
        showIframeView(url, 'analytics');
      } else {
        showDashboardView();
      }
    }
    setIsCreatingNewDashboard(false);
  };

  const handleNewDashboard = () => {
    setActiveDashboardId(null);
    setWidgetInstances([]);
    showDashboardView();
    setIsCreatingNewDashboard(true);
  };

  const handleSaveEmbed = (data: EmbedModalSaveData, instanceId?: string) => {
    const updateOrAdd = (newInstanceData: Partial<WidgetInstance>) => {
      if (instanceId) {
        setWidgetInstances((prev) =>
          prev.map((inst) =>
            inst.instanceId === instanceId
              ? { ...inst, ...newInstanceData }
              : inst
          )
        );
      } else {
        const newId = newInstanceData.id || 'embed';
        const newInstanceId = `${newId}-${Date.now()}`;
        const newWidgetInstance: WidgetInstance = {
          instanceId: newInstanceId,
          id: newId,
          layout: {
            i: newInstanceId,
            x: (widgets.length * 6) % 12,
            y: Infinity,
            w: 6,
            h: 8,
          },
          ...newInstanceData,
        };
        setWidgetInstances((prev) => [...prev, newWidgetInstance]);
      }
    };

    if (data.type === 'styled') {
      if (instanceId) {
        setWidgetInstances((prev) =>
          prev.map((inst) => {
            if (inst.instanceId === instanceId) {
              return {
                ...inst,
                widgetOid: data.config.widgetOid,
                dashboardOid: data.config.dashboardOid,
                styleConfig: data.config.styleConfig,
              };
            }
            return inst;
          })
        );
      } else {
        const newId = 'styled-embed';
        const newInstanceId = `${newId}-${Date.now()}`;
        const newWidgetInstance: WidgetInstance = {
          instanceId: newInstanceId,
          id: newId,
          layout: {
            i: newInstanceId,
            x: (widgets.length * 6) % 12,
            y: Infinity,
            w: 6,
            h: 8,
          },
          widgetOid: data.config.widgetOid,
          dashboardOid: data.config.dashboardOid,
          styleConfig: data.config.styleConfig,
        };
        setWidgetInstances((prev) => [...prev, newWidgetInstance]);
      }
    } else {
      updateOrAdd({
        id: 'embed',
        embedCode:
          data.type === 'sdk' || data.type === 'html'
            ? data.embedCode
            : undefined,
        styleConfig: undefined,
        widgetOid: undefined,
        dashboardOid: undefined,
      });
    }
    setIsEmbedModalOpen({ open: false });
  };

  const handleTitleDoubleClick = () => {
    const currentDashboard = dashboards.find((d) => d.id === activeDashboardId);
    if (isEditable && (currentDashboard || !activeDashboardId)) {
      setIsEditingTitle(true);
      setEditingTitleValue(
        currentDashboard ? currentDashboard.name : 'New Dashboard'
      );
    }
  };

  const handleSaveTitle = () => {
    if (activeDashboardId && editingTitleValue.trim()) {
      handleUpdateDashboard(activeDashboardId, editingTitleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitleEdit = () => {
    setIsEditingTitle(false);
  };

  const handleDeleteDashboard = async (dashboardId: string) => {
    const { error } = await supabase
      .from('dashboards')
      .delete()
      .eq('id', dashboardId);

    if (error) {
      console.error('Error deleting dashboard:', error);
    } else {
      setDashboards((prev) => prev.filter((d) => d.id !== dashboardId));
      if (activeDashboardId === dashboardId) {
        setActiveDashboardId(null);
      }
    }
  };

  const handleUpdateDashboardFolder = async (
    dashboardId: string,
    folderId: string | null
  ) => {
    setDashboards((prevDashboards) =>
      prevDashboards.map((d) =>
        d.id === dashboardId ? { ...d, folderId: folderId } : d
      )
    );

    const { error } = await supabase
      .from('dashboards')
      .update({ folder_id: folderId })
      .eq('id', dashboardId);

    if (error) {
      console.error('Error updating dashboard folder:', error);
    }
  };

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    widgetId: string | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    widgetId: null,
  });

  const handleContextMenu = (event: React.MouseEvent, widgetId: string) => {
    event.preventDefault();
    if (!isEditable) return;
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      widgetId,
    });
  };

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    if (contextMenu.visible) {
      window.addEventListener('click', closeContextMenu);
      return () => window.removeEventListener('click', closeContextMenu);
    }
  }, [contextMenu.visible, closeContextMenu]);

  const handleOpenInNewWindow = (dashboardId: string) => {
    const dashboard = dashboards.find((d) => d.id === dashboardId);
    if (dashboard && dashboard.iframeUrl) {
      const url = new URL(dashboard.iframeUrl, sisenseUrl).toString();
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const sisenseUrl = import.meta.env.VITE_SISENSE_URL;
  const sisenseToken = import.meta.env.VITE_SISENSE_TOKEN;

  if (!sisenseUrl || !sisenseToken) {
    return (
      <div className="app-state-container">
        <h1>Configuration Error</h1>
        <p>
          Please set <code>VITE_SISENSE_URL</code> and{' '}
          <code>VITE_SISENSE_TOKEN</code> in your <code>.env.local</code> file.
        </p>
      </div>
    );
  }

  const onBeforeRenderWrapper =
    (
      instanceId: string,
      onBeforeRenderFn: (options: any, gridLineStyle: GridlineStyle) => any,
      gridLineStyle: GridlineStyle
    ) =>
    (options: any) => {
      const currentInstance = widgetInstances.find(
        (inst) => inst.instanceId === instanceId
      );

      if (options.series && !currentInstance?.series) {
        const seriesInfo = options.series
          .filter((s: any) => s.name)
          .map((s: any) => ({
            name: s.name,
            color: s.color,
          }));

        if (seriesInfo.length > 0) {
          setTimeout(() => {
            setWidgetInstances((prev) =>
              prev.map((inst) =>
                inst.instanceId === instanceId
                  ? { ...inst, series: seriesInfo }
                  : inst
              )
            );
          }, 0);
        }
      }

      if (currentInstance?.colorConfig && options.series) {
        options.series.forEach((s: any) => {
          if (currentInstance.colorConfig![s.name]) {
            s.color = currentInstance.colorConfig![s.name];
          }
        });
      }

      return onBeforeRenderFn(options, gridLineStyle);
    };

  const isChartWidget = (widgetId: string | null): boolean => {
    if (!widgetId) return false;
    const instance = widgetInstances.find(
      (inst) => inst.instanceId === widgetId
    );
    if (!instance) return false;
    return instance.id.startsWith('chart') || instance.id === 'styled-embed';
  };

  const currentlyEditingWidget = widgets.find(
    (w) => w.instanceId === editingWidgetId
  );
  const currentlyEditingEmbed = isEmbedModalOpen.instanceId
    ? widgets.find((w) => w.instanceId === isEmbedModalOpen.instanceId)
    : null;
  const currentDashboardName =
    dashboards.find((d) => d.id === activeDashboardId)?.name ||
    (isCreatingNewDashboard ? 'New Dashboard' : 'Select a Dashboard');

  const onBeforeRenderStyledWidget = (
    options: any,
    styleConfig: StyleConfig
  ) => {
    if (!options.chart) options.chart = {};
    options.chart.backgroundColor = 'transparent';
    options.chart.animation = false;
    if (!options.plotOptions) options.plotOptions = {};
    options.plotOptions.series = {
      ...options.plotOptions.series,
      animation: false,
    };

    return options;
  };

  const currentlyEditingWidgetForColors = widgets.find(
    (w) => w.instanceId === editingWidgetId
  );

  const handleBackdropChange = (newBackdrop: any) => {
    setBackdrop(newBackdrop);
  };

  const dockItems = [
    { icon: <FaPalette size={18} />, label: 'Effects', onClick: () => setEffectsSettingsOpen(true) },
    { icon: <FaTableCellsLarge size={18} />, label: 'Backdrops', onClick: () => setIsBackdropSettingsOpen(true) },
    { icon: <FaCrosshairs size={18} />, label: 'Cursor', onClick: () => setCursorSettingsOpen(true) },
    { icon: <FaGear size={18} />, label: 'Dock Settings', onClick: () => setIsDockSettingsOpen(prev => !prev) }
  ];

  return (
    <SisenseContextProvider url={sisenseUrl} token={sisenseToken}>
      <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
        <div className="app-root">
          <Header
            isEditable={isEditable}
            toggleEditMode={toggleEditMode}
            onNewDashboard={handleNewDashboard}
            onAddEmbed={() => setIsEmbedModalOpen({ open: true })}
            themeMode={theme}
            onToggleAnalytics={() => showIframeView(`${sisenseUrl}/app/main/home?embed=true&edit=true&r=false&l=false&t=false`, 'analytics')}
            onToggleAdmin={() => showIframeView(`${sisenseUrl}/app/settings?embed=true&edit=true&r=true&l=true&t=true`, 'admin')}
            onToggleData={() => showIframeView(`${sisenseUrl}/app/main/data?embed=true&edit=true&r=false&l=false&t=false`, 'data')}
            onTogglePulse={() => showIframeView(`${sisenseUrl}/app/main/pulse?embed=true&edit=true&r=false&l=false&t=false`, 'pulse')}
            onProfileClick={() => showIframeView(`${sisenseUrl}/app/profile`, null)}
            onToggleCSDK={showDashboardView}
            activeView={activeView}
          />
          <div className="app-body">
            <SidePanel
              isCollapsed={isPanelCollapsed}
              togglePanel={togglePanel}
              folders={folders}
              dashboards={dashboards}
              activeDashboardId={activeDashboardId}
              onAddFolder={handleAddFolder}
              onUpdateFolder={handleUpdateFolder}
              onUpdateDashboard={handleUpdateDashboard}
              onDeleteFolder={handleDeleteFolder}
              onLoadDashboard={handleLoadDashboard}
              onDeleteDashboard={handleDeleteDashboard}
              onAllDashboardsClick={() => {
                setShowAllDashboards(true);
                setActiveDashboardId(null);
                setActiveView(null);
              }}
              onToggleUsageAnalytics={() => {
                setActiveView((prev) => (prev === 'usage' ? null : 'usage'));
                setActiveDashboardId(null);
              }}
              activeView={activeView}
              showAllDashboards={showAllDashboards}
              onOpenInNewWindow={handleOpenInNewWindow}
              onUpdateDashboardFolder={handleUpdateDashboardFolder}
            />
            <div className={`content-wrapper ${isCrosshairEnabled ? 'no-cursor' : ''}`}>
             {isCrosshairEnabled && (
                <Crosshair
                  containerRef={forwardedRef}
                  color={theme === 'dark' ? '#FFFFFF' : '#000000'}
                  mousePosition={mousePosition}
                  isVisible={isMouseInGrid}
                />
              )}
              {iframeUrl ? (
                <iframe
                  className="content-iframe"
                  src={iframeUrl}
                  frameBorder="0"
                ></iframe>
              ) : (
                <div className="dashboard-content">
                  <div className="dashboard-toolbar">
                    <div className="toolbar-left">
                      {isEditingTitle ? (
                        <div className="title-edit-container">
                          <input
                            type="text"
                            value={editingTitleValue}
                            onChange={(e) =>
                              setEditingTitleValue(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveTitle();
                              if (e.key === 'Escape') handleCancelTitleEdit();
                            }}
                            onBlur={handleCancelTitleEdit}
                            autoFocus
                            className="dashboard-title-input"
                          />
                          <div className="edit-actions">
                            <i
                              className="fas fa-check save-icon"
                              onClick={handleSaveTitle}
                            ></i>
                            <i
                              className="fas fa-times cancel-icon"
                              onClick={handleCancelTitleEdit}
                            ></i>
                          </div>
                        </div>
                      ) : (
                        <h1
                          className="dashboard-title"
                          onDoubleClick={handleTitleDoubleClick}
                        >
                          {currentDashboardName}
                        </h1>
                      )}
                    </div>
                    <div className="toolbar-right">
                      <div
                        className="save-button-container"
                        ref={saveDropdownRef}
                      >
                        <button
                          className="action-button"
                          onClick={() => setIsSaveDropdownOpen((prev) => !prev)}
                        >
                          Save View
                        </button>
                        {isSaveDropdownOpen && (
                          <SaveDropdown
                            onSave={handleSaveDashboardUpdate}
                            onSaveAs={() => {
                              setSaveModalOpen(true);
                              setIsSaveDropdownOpen(false);
                            }}
                            isSaveDisabled={!activeDashboardId}
                          />
                        )}
                      </div>
                      <button
                        className="action-button primary"
                        onClick={() => setLibraryOpen(true)}
                      >
                        + Add Widget
                      </button>
                      <ThemeToggleButton
                        theme={theme}
                        toggleTheme={toggleTheme}
                      />
                    </div>
                  </div>
                  <div
                    ref={forwardedRef}
                    className={`layout-wrapper bento-section ${
                      magicBentoSettings.isEnabled ? 'bento-active' : ''
                    }`}
                    onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
                    onMouseEnter={() => setIsMouseInGrid(true)}
                    onMouseLeave={() => setIsMouseInGrid(false)}
                  >
                    {backdrop.type === 'color' && (
                      <div className="backdrop" style={{ backgroundColor: backdrop.value }} />
                    )}
                    {backdrop.type === 'magnet-lines' && (
                      <div className="backdrop">
                        <MagnetLines
                          rows={30}
                          columns={30}
                          containerSize="100%"
                          lineColor={theme === 'dark' ? '#FFFFFF' : '#000000'}
                          lineWidth="1px"
                          lineHeight="20px"
                          baseAngle={-45}
                        />
                      </div>
                    )}
                    <ResponsiveGridLayout
                      className={`layout ${isEditable ? 'is-editable' : ''}`}
                      layouts={layouts}
                      onLayoutChange={onLayoutChange}
                      isDraggable={isEditable}
                      isResizable={isEditable}
                      onResizeStop={onResizeStop}
                      margin={[dockSettings.widgetPadding, dockSettings.widgetPadding]}
                      breakpoints={{
                        lg: 1200,
                        md: 996,
                        sm: 768,
                        xs: 480,
                        xxs: 2,
                      }}
                      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                      rowHeight={100}
                      compactType="vertical"
                    >
                      {widgets.map((w) => {
                        const isEmbed =
                          w.id === 'embed' || w.id === 'styled-embed';

                        return (
                          <div
                            key={w.instanceId}
                            className={`widget-container ${
                              isEditable ? 'is-editable' : ''
                            } ${isEmbed ? 'is-embed' : ''}`}
                            onContextMenu={(e) =>
                              handleContextMenu(e, w.instanceId)
                            }
                          >
                            {/* {w.id === 'conditional-color-filter-leak-rate' ? (
                                <ConditionalColorFilterWidget />
                            ) : */ w.id === 'styled-embed' &&
                            w.widgetOid &&
                            w.dashboardOid ? (
                              <DashboardWidget
                                widgetOid={w.widgetOid}
                                dashboardOid={w.dashboardOid}
                                styleOptions={
                                  w.styleConfig
                                    ? getStyleOptionsFromConfig(w.styleConfig)
                                    : getStyleOptions(theme)
                                }
                                onBeforeRender={
                                  w.styleConfig
                                    ? (options: any) =>
                                        onBeforeRenderStyledWidget(
                                          options,
                                          w.styleConfig
                                        )
                                    : undefined
                                }
                              />
                            ) : w.id === 'embed' && w.embedCode ? (
                              <CodeBlock
                                code={w.embedCode}
                                styleOptions={getStyleOptions(theme)}
                              />
                            ) : null}
                          </div>
                        );
                      })}
                    </ResponsiveGridLayout>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="dock-container">
            {isDockSettingsOpen && (
                <DockSettings
                    settings={dockSettings}
                    onSettingsChange={setDockSettings}
                    onClose={() => setIsDockSettingsOpen(false)}
                />
            )}
            {isBackdropSettingsOpen && (
              <BackdropSettings
                onClose={() => setIsBackdropSettingsOpen(false)}
                onBackdropChange={handleBackdropChange}
              />
            )}
            <Dock items={dockItems} {...dockSettings} />
          </div>

          {isLibraryOpen && (
            <Modal onClose={() => setLibraryOpen(false)} title="Widget Library">
              <WidgetLibrary onAddWidget={addWidget} />
            </Modal>
          )}

          {isEffectsSettingsOpen && (
            <EffectsSettings onClose={() => setEffectsSettingsOpen(false)} />
          )}

          {isCursorSettingsOpen && (
            <CursorSettings onClose={() => setCursorSettingsOpen(false)} />
          )}

          {isSaveModalOpen && (
            <Modal
              onClose={() => setSaveModalOpen(false)}
              title="Save Dashboard View"
            >
              <SaveDashboardForm
                folders={folders}
                onSave={handleSaveDashboard}
              />
            </Modal>
          )}

          {isEditorOpen && currentlyEditingWidget && (
            <Modal
              onClose={() => setEditorOpen(false)}
              title={`Editing: ${currentlyEditingWidget.title || 'Widget'}`}
            >
              <WidgetEditor
                currentStyle={
                  (currentlyEditingWidget as any).styleConfig?.gridLineStyle ||
                  'both'
                }
                onStyleChange={handleUpdateWidgetStyle}
              />
            </Modal>
          )}

          {isEmbedModalOpen.open && (
            <EmbedModal
              instanceId={isEmbedModalOpen.instanceId}
              initialConfig={
                currentlyEditingEmbed?.id === 'styled-embed'
                  ? {
                      widgetOid: currentlyEditingEmbed.widgetOid || '',
                      dashboardOid: currentlyEditingEmbed.dashboardOid || '',
                      styleConfig: currentlyEditingEmbed.styleConfig,
                    }
                  : undefined
              }
              initialEmbedCode={
                currentlyEditingEmbed?.id === 'embed'
                  ? currentlyEditingEmbed.embedCode
                  : undefined
              }
              onClose={() => setIsEmbedModalOpen({ open: false })}
              onSave={(data, instanceId) => {
                handleSaveEmbed(data, instanceId);
              }}
            />
          )}

          {contextMenu.visible && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              widgetId={contextMenu.widgetId}
              isChart={isChartWidget(contextMenu.widgetId)}
              onEdit={() => {
                if (contextMenu.widgetId) {
                  openEditorForWidget(contextMenu.widgetId);
                  closeContextMenu();
                }
              }}
              onEditColors={() => {
                if (contextMenu.widgetId) {
                  setEditingWidgetId(contextMenu.widgetId);
                  setColorEditorOpen(true);
                  closeContextMenu();
                }
              }}
              onRemove={() => {
                if (contextMenu.widgetId) {
                  removeWidget(contextMenu.widgetId);
                  closeContextMenu();
                }
              }}
            />
          )}
          {isColorEditorOpen &&
            currentlyEditingWidgetForColors &&
            currentlyEditingWidgetForColors.series && (
              <Modal
                onClose={() => setColorEditorOpen(false)}
                title={`Editing Colors: ${currentlyEditingWidgetForColors.title || 'Widget'}`}
              >
                <ChartColorStyler
                  series={currentlyEditingWidgetForColors.series.map((s) => ({
                    ...s,
                    color:
                      currentlyEditingWidgetForColors.colorConfig?.[s.name] ||
                      s.color,
                  }))}
                  onColorChange={handleUpdateWidgetColor}
                />
              </Modal>
            )}
        </div>
      </ThemeProvider>
    </SisenseContextProvider>
  );
};

export default App;