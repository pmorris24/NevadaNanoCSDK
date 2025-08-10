// src/components/EmbedModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  DashboardWidget,
  type DashboardWidgetStyleOptions,
} from '@sisense/sdk-ui';
import './EmbedModal.css';
import WidgetStyler, { type StyleConfig } from './widgetstyler.tsx';
import Highcharts from 'highcharts';
import CodeHighlighter from './CodeHighlighter';

export interface StyledWidgetConfig {
  widgetOid: string;
  dashboardOid: string;
  styleConfig: StyleConfig;
}

export type EmbedModalSaveData =
  | { type: 'styled'; config: StyledWidgetConfig }
  | { type: 'sdk'; embedCode: string }
  | { type: 'html'; embedCode: string };

interface EmbedModalProps {
  onSave: (data: EmbedModalSaveData, instanceId?: string) => void;
  onClose: () => void;
  initialConfig?: StyledWidgetConfig;
  initialEmbedCode?: string;
  instanceId?: string;
}

const getStyleOptionsFromConfig = (
  styleConfig: StyleConfig
): DashboardWidgetStyleOptions => {
  const { seriesColors, ...rest } = styleConfig;

  return {
    backgroundColor: rest.backgroundColor,
    border: rest.border,
    borderColor: rest.borderColor,
    cornerRadius: rest.cornerRadius,
    shadow: rest.shadow,
    spaceAround: rest.spaceAround,
    header: {
      backgroundColor: rest.headerBackgroundColor,
      dividerLine: rest.headerDividerLine,
      dividerLineColor: rest.headerDividerLineColor,
      hidden: rest.headerHidden,
      titleAlignment: rest.headerTitleAlignment,
      titleTextColor: rest.headerTitleTextColor,
    },
  };
};

const formatStyleOptions = (styleConfig: StyleConfig): string => {
  const options = getStyleOptionsFromConfig(styleConfig);
  let str = '{\n';
  for (const [key, value] of Object.entries(options)) {
    if (typeof value === 'object' && value !== null) {
      str += `    ${key}: {\n`;
      for (const [subKey, subValue] of Object.entries(value)) {
        str += `      ${subKey}: ${JSON.stringify(subValue)},\n`;
      }
      str += '    },\n';
    } else {
      str += `    ${key}: ${JSON.stringify(value)},\n`;
    }
  }
  str += '  }';
  return str;
};

const EmbedModal: React.FC<EmbedModalProps> = ({
  onSave,
  onClose,
  initialConfig,
  initialEmbedCode,
  instanceId,
}) => {
  const [activeTab, setActiveTab] = useState<'csdk' | 'sdk' | 'html'>(
    initialConfig ? 'csdk' : 'sdk'
  );
  const [isAutosaveEnabled, setAutosaveEnabled] = useState(true);

  const [styleConfig, setStyleConfig] = useState<StyleConfig>(
    initialConfig?.styleConfig || {
      chartType: 'column',
      gridLineStyle: 'both',
      backgroundColor: '#ffffff',
      axisColor: '#666666',
      borderColor: '#000000',
      border: true,
      cornerRadius: 'Medium',
      shadow: 'Medium',
      spaceAround: 'Medium',
      headerBackgroundColor: '#ffffff',
      headerDividerLine: true,
      headerDividerLineColor: '#E5E7EB',
      headerHidden: false,
      headerTitleAlignment: 'Left',
      headerTitleTextColor: '#111827',
      legendPosition: 'right',
      borderRadius: 10,
      barWidth: 20,
      barOpacity: 1,
      lineWidth: 2,
      markerRadius: 4,
      isDonut: true,
      donutWidth: 60,
      pieOpacity: 1,
      applyGradient: false,
      seriesColors: {},
    }
  );

  const [sdkWidgetOid, setSdkWidgetOid] = useState('');
  const [sdkDashboardOid, setSdkDashboardOid] = useState('');
  const [htmlValue, setHtmlValue] = useState('');
  const [csdkInput, setCsdkInput] = useState('');
  const [chartSeries, setChartSeries] = useState<
    { name: string; color: string }[]
  >([]);
  const [lastChangedKey, setLastChangedKey] = useState<string | null>(null);

  const widgetOid = useMemo(
    () => csdkInput.match(/widgetOid="([^"]*)"/)?.[1] || null,
    [csdkInput]
  );
  const dashboardOid = useMemo(
    () => csdkInput.match(/dashboardOid="([^"]*)"/)?.[1] || null,
    [csdkInput]
  );

  useEffect(() => {
    if (widgetOid && dashboardOid && lastChangedKey) {
      const styleOptionsString = formatStyleOptions(styleConfig);
      const newCode = `<WidgetById
  widgetOid="${widgetOid}"
  dashboardOid="${dashboardOid}"
  styleOptions={${styleOptionsString}}
/>`;
      setCsdkInput(newCode);
    }
  }, [styleConfig, lastChangedKey, widgetOid, dashboardOid]);

  useEffect(() => {
    if (instanceId) {
      if (initialConfig) {
        setActiveTab('csdk');
        setStyleConfig(initialConfig.styleConfig);
        const styleOptionsString = formatStyleOptions(
          initialConfig.styleConfig
        );
        const initialCode = `<WidgetById
  widgetOid="${initialConfig.widgetOid}"
  dashboardOid="${initialConfig.dashboardOid}"
  styleOptions={${styleOptionsString}}
/>`;
        setCsdkInput(initialCode);
      } else if (initialEmbedCode) {
        const isHtml =
          initialEmbedCode.trim().startsWith('<') &&
          !initialEmbedCode.includes('WidgetById');
        if (isHtml) {
          setActiveTab('html');
          setHtmlValue(initialEmbedCode);
        } else {
          setActiveTab('sdk');
          const wOid = initialEmbedCode.match(/widgetOid="([^"]*)"/)?.[1] || '';
          const dOid =
            initialEmbedCode.match(/dashboardOid="([^"]*)"/)?.[1] || '';
          setSdkWidgetOid(wOid);
          setSdkDashboardOid(dOid);
        }
      }
    }
  }, [instanceId, initialConfig, initialEmbedCode]);

  const styleOptions: DashboardWidgetStyleOptions =
    getStyleOptionsFromConfig(styleConfig);

  const onBeforeRenderForPreview = useMemo(() => {
    return (options: any) => {
      if (!options.chart) options.chart = {};
      options.chart.backgroundColor = 'transparent';
      options.chart.animation = false;

      if (!options.plotOptions) options.plotOptions = {};
      options.plotOptions.series = {
        ...options.plotOptions.series,
        animation: false,
      };

      let seriesInfo: { name: string; color: string }[] = [];
      const isPieChart = options.chart?.type === 'pie';

      if (isPieChart && options.series?.[0]?.data) {
        seriesInfo = options.series[0].data
          .map((point: any) => ({ name: point.name, color: point.color }))
          .filter(Boolean);
      } else if (options.series) {
        seriesInfo = options.series
          .map((s: any) => ({ name: s.name, color: s.color }))
          .filter(Boolean);
      }

      if (JSON.stringify(seriesInfo) !== JSON.stringify(chartSeries)) {
        setTimeout(() => setChartSeries(seriesInfo), 0);
      }

      if (styleConfig.seriesColors) {
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
        (Array.isArray(options.xAxis)
          ? options.xAxis
          : [options.xAxis]
        ).forEach((axis: any) => Highcharts.merge(true, axis, axisOptions));
      if (options.yAxis)
        (Array.isArray(options.yAxis)
          ? options.yAxis
          : [options.yAxis]
        ).forEach((axis: any) => Highcharts.merge(true, axis, axisOptions));

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
                [0, (s.color as string) + '90'],
                [1, '#FFFFFF00'],
              ],
            };
          }
        });
      }
      return options;
    };
  }, [styleConfig, chartSeries]);

  const handleSave = () => {
    let saveData: EmbedModalSaveData;
    switch (activeTab) {
      case 'csdk':
        if (!widgetOid || !dashboardOid) return;
        saveData = {
          type: 'styled',
          config: { widgetOid, dashboardOid, styleConfig },
        };
        break;
      case 'sdk':
        if (!sdkWidgetOid || !sdkDashboardOid) return;
        saveData = {
          type: 'sdk',
          embedCode: `<WidgetById widgetOid="${sdkWidgetOid}" dashboardOid="${sdkDashboardOid}" />`,
        };
        break;
      case 'html':
        if (!htmlValue) return;
        saveData = { type: 'html', embedCode: htmlValue };
        break;
      default:
        return;
    }
    onSave(saveData, instanceId);
  };

  const handleStyleChange = (newConf: Partial<StyleConfig>, key?: string) => {
    const changeKey = key || Object.keys(newConf)[0];
    setStyleConfig((prev: StyleConfig) => ({ ...prev, ...newConf }));
    setLastChangedKey(changeKey);
  };

  const renderCSDKTab = () => (
    <div className="csdk-layout">
      <div className="top-row">
        <div className="panel-card">
          <div className="panel-header">
            <span className="step-circle">1</span>
            <h3 className="panel-title">Paste Widget Code</h3>
          </div>
          <div className="panel-content panel-content-code">
            <div className="code-input-wrapper">
              <CodeHighlighter
                code={csdkInput}
                lastChangedKey={lastChangedKey}
              />
              <textarea
                value={csdkInput}
                onChange={(e) => {
                  setCsdkInput(e.target.value);
                  setLastChangedKey(null);
                }}
                placeholder={`<WidgetById widgetOid="..." dashboardOid="..." />`}
                className="code-textarea"
              />
            </div>
          </div>
        </div>
        <div className="panel-card">
          <div className="panel-header">
            <span className="step-circle">2</span>
            <h3 className="panel-title">Live Preview</h3>
          </div>
          <div className="panel-content">
            <div className="live-preview-wrapper">
              {widgetOid && dashboardOid ? (
                <DashboardWidget
                  widgetOid={widgetOid}
                  dashboardOid={dashboardOid}
                  styleOptions={styleOptions}
                  onBeforeRender={onBeforeRenderForPreview}
                />
              ) : (
                <div className="preview-placeholder">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <p>Paste widget code to see a live preview</p>
                  <p>Changes will update in real-time</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <WidgetStyler
        styleConfig={styleConfig}
        onStyleChange={handleStyleChange}
        series={chartSeries}
      />
    </div>
  );

  const renderSDKTab = () => (
    <div className="form-section">
      <div className="sdk-input-group">
        <label htmlFor="sdk-widgetOid" className="label">
          Widget OID
        </label>
        <input
          id="sdk-widgetOid"
          type="text"
          className="styled-input"
          placeholder="Enter Widget OID"
          value={sdkWidgetOid}
          onChange={(e) => setSdkWidgetOid(e.target.value)}
        />
      </div>
      <div className="sdk-input-group">
        <label htmlFor="sdk-dashboardOid" className="label">
          Dashboard OID
        </label>
        <input
          id="sdk-dashboardOid"
          type="text"
          className="styled-input"
          placeholder="Enter Dashboard OID"
          value={sdkDashboardOid}
          onChange={(e) => setSdkDashboardOid(e.target.value)}
        />
      </div>
    </div>
  );

  const renderHTMLTab = () => (
    <div className="form-section">
      <textarea
        value={htmlValue}
        onChange={(e) => setHtmlValue(e.target.value)}
        placeholder="<p>Paste your HTML embed code here</p>"
        className="styled-textarea"
      />
    </div>
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal-content ${
          activeTab === 'csdk' ? 'modal-content-wide' : 'modal-content-default'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 className="modal-title">
              {instanceId ? 'Edit Widget' : 'Embed & Style Widget'}
            </h2>
            <p className="modal-description">
              Customize your widget's appearance and generate embed code
            </p>
          </div>
          <button onClick={onClose} className="close-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="embed-tabs-container">
            <button
              className={`tab-button ${activeTab === 'csdk' ? 'active' : ''}`}
              onClick={() => setActiveTab('csdk')}
            >
              Styled SDK
            </button>
            <button
              className={`tab-button ${activeTab === 'sdk' ? 'active' : ''}`}
              onClick={() => setActiveTab('sdk')}
            >
              Simple SDK
            </button>
            <button
              className={`tab-button ${activeTab === 'html' ? 'active' : ''}`}
              onClick={() => setActiveTab('html')}
            >
              HTML
            </button>
          </div>
          <div className="embed-content-area">
            {activeTab === 'csdk' && renderCSDKTab()}
            {activeTab === 'sdk' && renderSDKTab()}
            {activeTab === 'html' && renderHTMLTab()}
          </div>
        </div>
        <div className="modal-footer">
          <div className="footer-actions-left">
            <div className="autosave-toggle">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isAutosaveEnabled}
                  onChange={() => setAutosaveEnabled((p) => !p)}
                />
                <span className="slider"></span>
              </label>
              <span className="footer-note">Auto-save enabled</span>
            </div>
          </div>
          <div className="footer-actions-right">
            <button onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              Save & Embed Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbedModal;