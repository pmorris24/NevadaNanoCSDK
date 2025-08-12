// src/components/ChartColorStyler.tsx
import React from 'react';
import './ChartColorStyler.css';

interface ChartColorStylerProps {
  series: { name: string; color: string }[];
  onColorChange: (seriesName: string, newColor: string) => void;
}

const ChartColorStyler: React.FC<ChartColorStylerProps> = ({
  series,
  onColorChange,
}) => {
  // Filter out series that are hidden from the legend
  const visibleSeries = series.filter(
    (s) => !s.name.endsWith('_data') && s.name !== 'Forecast Marker'
  );

  return (
    <div className="chart-color-styler">
      <h4 className="styler-section-title">Series Colors</h4>
      <p className="styler-section-subtitle">
        Choose a custom color for each series in the chart.
      </p>
      <div className="color-options-container">
        {visibleSeries.map((s) => (
          <div key={s.name} className="color-option-row">
            <span className="series-name">
              <span
                className="color-swatch-preview"
                style={{ backgroundColor: s.color }}
              ></span>
              {s.name}
            </span>
            <input
              type="color"
              value={s.color}
              onChange={(e) => onColorChange(s.name, e.target.value)}
              className="color-picker-input"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartColorStyler;
