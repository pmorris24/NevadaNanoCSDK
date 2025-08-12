// src/components/widgetstyler.tsx
import React from 'react';
import './widgetstyler.css';
import { type GridlineStyle } from './WidgetEditor';

export type ChartType =
  | 'column'
  | 'bar'
  | 'pie'
  | 'area'
  | 'line'
  | 'other'
  | 'indicator'
  | 'pivot'
  | 'table'
  | 'scatter'
  | 'treemap'
  | 'calendar'
  | 'scatterMap'
  | 'areaMap'
  | 'sunburst'
  | 'box'
  | 'polar'
  | 'funnel'
  | 'blox'
  | 'tabber';

export interface StyleConfig {
  gridLineStyle: GridlineStyle;
  backgroundColor: string;
  axisColor: string;
  borderColor: string;
  border: boolean;
  cornerRadius: 'Large' | 'Medium' | 'Small';
  shadow: 'Dark' | 'Medium' | 'Light' | 'None';
  spaceAround: 'Large' | 'Medium' | 'Small';
  headerBackgroundColor: string;
  headerDividerLine: boolean;
  headerDividerLineColor: string;
  headerHidden: boolean;
  headerTitleAlignment: 'Left' | 'Center';
  headerTitleTextColor: string;
  legendPosition: 'right' | 'left' | 'top' | 'bottom' | 'hidden';
  chartType: ChartType;
  borderRadius: number;
  barWidth: number;
  barOpacity: number;
  lineWidth: number;
  markerRadius: number;
  isDonut: boolean;
  donutWidth: number;
  pieOpacity: number;
  applyGradient: boolean;
  seriesColors: Record<string, string>; // To store color overrides
}

interface WidgetStylerProps {
  styleConfig: StyleConfig;
  onStyleChange: (newConfig: Partial<StyleConfig>, key?: string) => void;
  series: { name: string; color: string }[]; // Pass series data to the styler
}

const ColorPickerCombo: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  seriesName?: string; // Optional series name for color changes
}> = ({ label, name, value, onChange, seriesName }) => (
  <div className="styler-control">
    <label className="styler-label" htmlFor={`${name}-text`} title={label}>
      {label}
    </label>
    <div className="styler-color-input-combo">
      <input
        type="color"
        id={name}
        name={name}
        value={value || '#000000'}
        onChange={onChange}
        className="swatch"
        aria-label={`${label} color picker`}
        data-series-name={seriesName}
      />
      <span className="hex-input">{(value || '#000000').toUpperCase()}</span>
    </div>
  </div>
);

const SliderControl: React.FC<{
  label: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, value, min, max, step, unit, onChange }) => {
  const displayValue =
    unit === '%' && max > 1
      ? value
      : unit === '%'
      ? Math.round(value * 100)
      : Math.round(value);
  const percentage = ((value - min) / (max - min)) * 100;
  const sliderStyle = {
    '--slider-percentage': `${percentage}%`,
  } as React.CSSProperties;

  return (
    <div className="styler-control">
      <div className="styler-control-row">
        <label htmlFor={name} className="styler-label">
          {label}
        </label>
        <span className="range-value">
          {displayValue}
          {unit}
        </span>
      </div>
      <div className="slider-container">
        <input
          type="range"
          id={name}
          name={name}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="styler-range"
          style={sliderStyle}
          data-type="number"
        />
      </div>
    </div>
  );
};

const ToggleSwitchControl: React.FC<{
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, checked, onChange }) => (
  <div className="styler-control-row styler-switch-control">
    <label htmlFor={name} className="styler-label">
      {label}
    </label>
    <label className="switch">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
      />
      <span className="slider"></span>
    </label>
  </div>
);

const WidgetStyler: React.FC<WidgetStylerProps> = ({
  styleConfig,
  onStyleChange,
  series,
}) => {
  const handleValueChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let finalValue: string | number | boolean;

    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (
      type === 'range' ||
      e.target.dataset.type === 'number' ||
      type === 'number'
    ) {
      finalValue = Number(value);
    } else {
      finalValue = value;
    }
    onStyleChange({ [name]: finalValue }, name);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seriesName = e.target.dataset.seriesName;
    if (seriesName) {
      const newSeriesColors = {
        ...styleConfig.seriesColors,
        [seriesName]: e.target.value,
      };
      onStyleChange({ seriesColors: newSeriesColors }, seriesName);
    } else {
      onStyleChange({ [e.target.name]: e.target.value }, e.target.name);
    }
  };

  const gridlineOptions: { value: GridlineStyle; label: string }[] = [
    { value: 'both', label: 'Standard' },
    { value: 'y-only', label: 'Horizontal Only' },
    { value: 'x-only', label: 'Vertical Only' },
    { value: 'dots', label: 'Dotted' },
    { value: 'none', label: 'None' },
  ];

  const visibleSeries = series.filter(
    (s) => s.name && !s.name.endsWith('_data') && s.name !== 'Forecast Marker'
  );

  return (
    <div className="panel-card styler-card">
      <div className="panel-header">
        <span className="step-circle">3</span>
        <h3 className="panel-title">Customize Styles</h3>
      </div>
      <div className="panel-content styler-panel-content">
        <div className="styler-layout">
          {/* Column 1: Chart Config */}
          <div className="styler-column">
            <div className="styler-section">
              <h4 className="styler-section-title">
                <i className="fas fa-cog"></i> Chart Configuration
              </h4>
              <div className="styler-control">
                <label className="styler-label" htmlFor="chartType">
                  Chart Type
                </label>
                <select
                  id="chartType"
                  name="chartType"
                  className="styler-select"
                  value={styleConfig.chartType}
                  onChange={handleValueChange}
                >
                  <option value="column">Column Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="area">Area Chart</option>
                </select>
              </div>
              <div className="styler-control">
                <label className="styler-label" htmlFor="legendPosition">
                  Legend Position
                </label>
                <select
                  id="legendPosition"
                  name="legendPosition"
                  className="styler-select"
                  value={styleConfig.legendPosition}
                  onChange={handleValueChange}
                >
                  <option value="right">Right</option>
                  <option value="left">Left</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>
          </div>

          {/* Column 2: General Appearance */}
          <div className="styler-column">
            <div className="styler-section">
              <h4 className="styler-section-title">
                <i className="fas fa-paint-brush"></i> General Appearance
              </h4>
              <ColorPickerCombo
                label="Background Color"
                name="backgroundColor"
                value={styleConfig.backgroundColor}
                onChange={handleColorChange}
              />
              <ColorPickerCombo
                label="Border Color"
                name="borderColor"
                value={styleConfig.borderColor}
                onChange={handleColorChange}
              />
              <div className="styler-control">
                <label className="styler-label" htmlFor="cornerRadius">
                  Corner Radius
                </label>
                <select
                  id="cornerRadius"
                  name="cornerRadius"
                  className="styler-select"
                  value={styleConfig.cornerRadius}
                  onChange={handleValueChange}
                >
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </div>
              <ToggleSwitchControl
                label="Border"
                name="border"
                checked={styleConfig.border}
                onChange={handleValueChange}
              />
            </div>
          </div>

          {/* Column 3: Header */}
          <div className="styler-column">
            <div className="styler-section">
              <h4 className="styler-section-title">
                <i className="fas fa-window-maximize"></i> Header
              </h4>
              <ColorPickerCombo
                label="Background Color"
                name="headerBackgroundColor"
                value={styleConfig.headerBackgroundColor}
                onChange={handleColorChange}
              />
              <ColorPickerCombo
                label="Title Text Color"
                name="headerTitleTextColor"
                value={styleConfig.headerTitleTextColor}
                onChange={handleColorChange}
              />
              <ColorPickerCombo
                label="Divider Line Color"
                name="headerDividerLineColor"
                value={styleConfig.headerDividerLineColor}
                onChange={handleColorChange}
              />
              <ToggleSwitchControl
                label="Divider Line"
                name="headerDividerLine"
                checked={styleConfig.headerDividerLine}
                onChange={handleValueChange}
              />
              <div className="styler-control">
                <label className="styler-label" htmlFor="headerTitleAlignment">
                  Title Alignment
                </label>
                <select
                  id="headerTitleAlignment"
                  name="headerTitleAlignment"
                  className="styler-select"
                  value={styleConfig.headerTitleAlignment}
                  onChange={handleValueChange}
                >
                  <option value="Left">Left</option>
                  <option value="Center">Center</option>
                </select>
              </div>
              <ToggleSwitchControl
                label="Hidden"
                name="headerHidden"
                checked={styleConfig.headerHidden}
                onChange={handleValueChange}
              />
            </div>
          </div>

          {/* Column 4: Axes & Gridlines */}
          <div className="styler-column">
            <div className="styler-section">
              <h4 className="styler-section-title">
                <i className="fas fa-border-all"></i> Axis & Gridlines
              </h4>
              <ColorPickerCombo
                label="Axis Color"
                name="axisColor"
                value={styleConfig.axisColor}
                onChange={handleColorChange}
              />
              <div className="styler-control">
                <label className="styler-label" htmlFor="gridLineStyle">
                  Gridline Style
                </label>
                <select
                  id="gridLineStyle"
                  name="gridLineStyle"
                  className="styler-select"
                  value={styleConfig.gridLineStyle}
                  onChange={handleValueChange}
                >
                  {gridlineOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Column 5: Chart-Specific Styles */}
          <div className="styler-column">
            {styleConfig.chartType === 'pie' && (
              <div className="styler-section">
                <h4 className="styler-section-title">
                  <i className="fas fa-chart-pie"></i> Pie/Donut Styles
                </h4>
                <ToggleSwitchControl
                  label="Donut Chart"
                  name="isDonut"
                  checked={styleConfig.isDonut}
                  onChange={handleValueChange}
                />
                {styleConfig.isDonut && (
                  <SliderControl
                    label="Donut Width"
                    name="donutWidth"
                    value={styleConfig.donutWidth}
                    min={10}
                    max={90}
                    step={5}
                    unit="%"
                    onChange={handleValueChange}
                  />
                )}
                <SliderControl
                  label="Pie Opacity"
                  name="pieOpacity"
                  value={styleConfig.pieOpacity}
                  min={0.1}
                  max={1}
                  step={0.1}
                  unit="%"
                  onChange={handleValueChange}
                />
              </div>
            )}
            {(styleConfig.chartType === 'bar' ||
              styleConfig.chartType === 'column') && (
              <div className="styler-section">
                <h4 className="styler-section-title">
                  <i className="fas fa-chart-bar"></i> Bar/Column Styles
                </h4>
                <SliderControl
                  label="Corner Radius"
                  name="borderRadius"
                  value={styleConfig.borderRadius}
                  min={0}
                  max={20}
                  step={1}
                  unit="px"
                  onChange={handleValueChange}
                />
                <SliderControl
                  label="Bar Width"
                  name="barWidth"
                  value={styleConfig.barWidth}
                  min={10}
                  max={80}
                  step={1}
                  unit="px"
                  onChange={handleValueChange}
                />
                <SliderControl
                  label="Bar Opacity"
                  name="barOpacity"
                  value={styleConfig.barOpacity}
                  min={0.1}
                  max={1}
                  step={0.05}
                  unit="%"
                  onChange={handleValueChange}
                />
              </div>
            )}
          </div>

          {/* Column 6: Series Colors */}
          <div className="styler-column series-color-column">
            <div className="styler-section">
              <h4 className="styler-section-title">
                <i className="fas fa-palette"></i> Series Colors
              </h4>
              {visibleSeries.length > 0 && (
                <div className="styler-palette-grid">
                  {visibleSeries.map((s) => (
                    <ColorPickerCombo
                      key={s.name}
                      label={s.name}
                      name={`seriesColors-${s.name}`}
                      value={styleConfig.seriesColors?.[s.name] || s.color}
                      onChange={handleColorChange}
                      seriesName={s.name}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetStyler;
