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

const ResponsiveGridLayout = WidthProvider(Responsive);

// Helper functions for cookies
const setCookie = (name: string, value: string, days: number) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  };
  
  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

// --- WIDGET CATALOG & OID MAP ---
const WIDGET_CATALOG: any[] = [];
const WIDGET_OID_MAP: Record<
  string,
  { widgetOid: string; dashboardOid: string }
> = {};

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
  const [dataState, setDataState] = useState<'loading' | 'loaded' | 'error'>('loading');

  const widgets = widgetInstances.map((inst) => {
    const catalogEntry = WIDGET_CATALOG.find((w) => w.id === inst.id);
    return { ...catalogEntry, ...inst };
  });

  const layouts = { lg: widgetInstances.map((inst) => inst.layout) };

  const forwardedRef = useRef<HTMLDivElement>(null);

  useMagicBento(forwardedRef, magicBentoSettings, isEditable, layouts, mousePosition);

  useEffect(() => {
    setDataState('loading');
    try {
      const foldersCookie = getCookie('folders');
      if (foldersCookie) {
        setFolders(JSON.parse(foldersCookie));
      }

      const dashboardsCookie = getCookie('dashboards');
      if (dashboardsCookie) {
        setDashboards(JSON.parse(dashboardsCookie));
      }
      
      setDataState('loaded');
    } catch (error) {
      console.error('Error loading data from cookies:', error);
      setDataState('error');
    }
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
    setCookie('folders', JSON.stringify(folders), 365);
  }, [folders]);

  useEffect(() => {
    setCookie('dashboards', JSON.stringify(dashboards), 365);
  }, [dashboards]);

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

  const handleAddFolder = (name: string) => {
    const newFolder: Folder = { id: `f-${Date.now()}`, name };
    setFolders((prev) => [...prev, newFolder]);
  };

  const handleUpdateFolder = (
    id: string,
    newName: string,
    newColor?: string
  ) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, name: newName, color: newColor } : f
      )
    );
  };

  const handleUpdateDashboard = (id: string, newName: string) => {
    setDashboards((prev) =>
      prev.map((d) => (d.id === id ? { ...d, name: newName } : d))
    );
  };

  const handleDeleteFolder = (id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setDashboards((prev) => prev.filter((d) => d.folderId !== id));
  };

  const handleSaveDashboard = (folderId: string, name: string) => {
    const newDashboard: Dashboard = {
      id: `d-${Date.now()}`,
      name,
      folderId,
      widgetInstances: widgetInstances,
      theme: theme,
    };
    setDashboards((prev) => [...prev, newDashboard]);
    setActiveDashboardId(newDashboard.id);
    setSaveModalOpen(false);
    setIsCreatingNewDashboard(false);
  };

  const handleSaveDashboardUpdate = () => {
    if (!activeDashboardId) return;

    setDashboards((prevDashboards) =>
      prevDashboards.map((d) =>
        d.id === activeDashboardId
          ? {
              ...d,
              widgetInstances: widgetInstances,
              theme: theme,
            }
          : d
      )
    );
    setIsSaveDropdownOpen(false);
  };

  const handleLoadDashboard = (dashboardId: string) => {
    setActiveDashboardId(dashboardId);
    const dashboard = dashboards.find((d) => d.id === dashboardId);
    if (dashboard) {
      if (dashboard.theme) {
        setTheme(dashboard.theme);
      }
      if (dashboard.iframeUrl) {
        showIframeView(dashboard.iframeUrl, 'analytics');
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

  const handleDeleteDashboard = (dashboardId: string) => {
    setDashboards((prev) => prev.filter((d) => d.id !== dashboardId));
    if (activeDashboardId === dashboardId) {
      setActiveDashboardId(null);
    }
  };

  const handleUpdateDashboardFolder = (
    dashboardId: string,
    folderId: string | null
  ) => {
    setDashboards((prevDashboards) =>
      prevDashboards.map((d) =>
        d.id === dashboardId ? { ...d, folderId: folderId } : d
      )
    );
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
      window.open(dashboard.iframeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const sisenseUrl = import.meta.env.VITE_SISENSE_URL;
  const sisenseToken = import.meta.env.VITE_SISENSE_TOKEN;

  if (!sisenseUrl || !sisenseToken) {
    return (
      <div className="config-error">
        <h1>Configuration Error</h1>
        <p>
          Please set <code>VITE_SISENSE_URL</code> and{' '}
          <code>VITE_SISENSE_TOKEN</code> in your <code>.env.local</code> file.
        </p>
      </div>
    );
  }

  if (dataState === 'loading') {
    return (
      <div className="app-state-container">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (dataState === 'error') {
    return (
      <div className="app-state-container">
        <h1>Error loading data</h1>
        <p>
          There was a problem loading data from cookies.
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

    if (styleConfig.seriesColors) {
      const isPieChart = options.chart?.type === 'pie';
      if (isPieChart && options.series?.[0]?.data) {
        options.series[0].data.forEach((point: any) => {
          if (styleConfig.seriesColors[point.name]) {
            point.color = styleConfig.seriesColors[point.name];
          }
        });
      } else if (options.series) {
        options.series.forEach((s: any) => {
          if (styleConfig.seriesColors[s.name]) {
            s.color = styleConfig.seriesColors[s.name];
            // Remove individual point colors to ensure series color is applied
            if (s.data) {
              s.data.forEach((point: any) => {
                if (point && typeof point === 'object') {
                  point.color = undefined;
                }
              });
            }
          }
        });
      }
    }

    const axisOptions = {
      gridLineColor: styleConfig.axisColor,
      lineColor: styleConfig.axisColor,
      tickColor: styleConfig.axisColor,
    };

    const applyGridStyle = (
      axisCollection: any,
      style: { width: number; dashStyle?: 'Solid' | 'Dot' }
    ) => {
      if (!axisCollection) return;
      (Array.isArray(axisCollection)
        ? axisCollection
        : [axisCollection]
      ).forEach((axis: any) => {
        axis.gridLineWidth = style.width;
        if (style.dashStyle) {
          axis.gridLineDashStyle = style.dashStyle;
        }
      });
    };

    if (options.xAxis)
      (Array.isArray(options.xAxis) ? options.xAxis : [options.xAxis]).forEach(
        (axis: any) => Highcharts.merge(true, axis, axisOptions)
      );
    if (options.yAxis)
      (Array.isArray(options.yAxis) ? options.yAxis : [options.yAxis]).forEach(
        (axis: any) => Highcharts.merge(true, axis, axisOptions)
      );

    switch (styleConfig.gridLineStyle) {
      case 'both':
        applyGridStyle(options.xAxis, { width: 1, dashStyle: 'Solid' });
        applyGridStyle(options.yAxis, { width: 1, dashStyle: 'Solid' });
        break;
      case 'y-only':
        applyGridStyle(options.xAxis, { width: 0 });
        applyGridStyle(options.yAxis, { width: 1, dashStyle: 'Solid' });
        break;
      case 'x-only':
        applyGridStyle(options.xAxis, { width: 1, dashStyle: 'Solid' });
        applyGridStyle(options.yAxis, { width: 0 });
        break;
      case 'dots':
        applyGridStyle(options.xAxis, { width: 1, dashStyle: 'Dot' });
        applyGridStyle(options.yAxis, { width: 1, dashStyle: 'Dot' });
        break;
      case 'none':
        applyGridStyle(options.xAxis, { width: 0 });
        applyGridStyle(options.yAxis, { width: 0 });
        break;
    }

    if (!options.legend) options.legend = {};
    if (styleConfig.legendPosition === 'hidden') {
      options.legend.enabled = false;
    } else {
      options.legend.enabled = true;
      options.legend.align =
        styleConfig.legendPosition === 'left' ||
        styleConfig.legendPosition === 'right'
          ? styleConfig.legendPosition
          : 'center';
      options.legend.verticalAlign =
        styleConfig.legendPosition === 'top' ||
        styleConfig.legendPosition === 'bottom'
          ? styleConfig.legendPosition
          : 'middle';
      options.legend.layout =
        styleConfig.legendPosition === 'left' ||
        styleConfig.legendPosition === 'right'
          ? 'vertical'
          : 'horizontal';
    }

    if (!options.plotOptions) options.plotOptions = {};
    options.plotOptions.series = {
      ...options.plotOptions.series,
      borderRadius: styleConfig.borderRadius,
      pointWidth: styleConfig.barWidth,
      opacity: styleConfig.barOpacity,
      borderColor: styleConfig.borderColor,
      borderWidth: 1,
    };
    options.plotOptions.pie = {
      ...options.plotOptions.pie,
      innerSize: styleConfig.isDonut ? `${styleConfig.donutWidth}%` : '0%',
      opacity: styleConfig.pieOpacity,
      borderColor: styleConfig.borderColor,
      borderWidth: 2,
    };
    options.plotOptions.line = {
      ...options.plotOptions.line,
      lineWidth: styleConfig.lineWidth,
      marker: {
        ...options.plotOptions.line?.marker,
        radius: styleConfig.markerRadius,
      },
    };
    options.plotOptions.area = {
      ...options.plotOptions.area,
      lineWidth: styleConfig.lineWidth,
      marker: {
        ...options.plotOptions.area?.marker,
        radius: styleConfig.markerRadius,
      },
    };

    if (styleConfig.applyGradient && options.series) {
      options.series.forEach((s: any) => {
        if (s.type === 'area') {
          s.fillColor = {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, s.color + '90'],
              [1, '#FFFFFF00'],
            ],
          };
        }
      });
    }
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
            onToggleAnalytics={() =>
              showIframeView(
                'https://signup-yaf29czo.sisense.com/app/main/home',
                'analytics'
              )
            }
            onToggleAdmin={() =>
              showIframeView(
                'https://aesandbox.sisensepoc.com/app/settings?embed=true',
                'admin'
              )
            }
            onToggleData={() =>
              showIframeView(
                'https://signup-yaf29czo.sisense.com/app/data',
                'data'
              )
            }
            onTogglePulse={() =>
                showIframeView(
                  'https://signup-yaf29czo.sisense.com/app/main/pulse',
                  'pulse'
                )
              }
            onProfileClick={() =>
              showIframeView(
                'https://aesandbox.sisensepoc.com/app/profile/personalinfo?embed=true',
                null
              )
            }
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
                        const WidgetComponent = (w as any).component;
                        const oids = WIDGET_OID_MAP[w.id];
                        const gridLineStyle =
                          (w as any).styleConfig?.gridLineStyle || 'both';
                        const isEmbed =
                          w.id === 'embed' || w.id === 'styled-embed';

                          const onBeforeRenderFn = (options: any, style: GridlineStyle) => applyTheming(options, style);

                        const finalOnBeforeRender = onBeforeRenderWrapper(
                          w.instanceId,
                          onBeforeRenderFn,
                          gridLineStyle
                        );

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
                            {w.id === 'styled-embed' &&
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
                            ) : WidgetComponent ? (
                              <WidgetComponent {...oids} themeMode={theme} />
                            ) : oids ? (
                              <DashboardWidget
                                widgetOid={oids?.widgetOid}
                                dashboardOid={oids?.dashboardOid}
                                title={
                                  w.id.startsWith('kpi') ? undefined : w.title
                                }
                                styleOptions={getStyleOptions(theme)}
                                onBeforeRender={finalOnBeforeRender}
                              />
                            ) : null }
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
              title={`Editing: ${currentlyEditingWidget.title}`}
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
                title={`Editing Colors: ${currentlyEditingWidgetForColors.title}`}
              >
                <ChartColorStyler
                  series={currentlyEditingWidgetForColors.series.map((s: { name: string; color: string; }) => ({
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