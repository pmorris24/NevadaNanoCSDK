// src/components/WidgetLibrary.tsx
import React from 'react';
import './WidgetLibrary.css';

const WIDGET_CATALOG: any[] = [
  {
    id: 'conditional-color-filter-leak-rate',
    title: 'Leak Rate by Name (Color Filter)',
    description: 'A bar chart showing leak rate with interactive, color-coded filters based on conditional rules.',
    defaultLayout: { w: 8, h: 10 },
  },
];

interface WidgetLibraryProps {
  onAddWidget: (widget: any) => void;
}

const WidgetLibrary: React.FC<WidgetLibraryProps> = ({ onAddWidget }) => {
  return (
    <div className="widget-library">
      {WIDGET_CATALOG.map((widget) => (
        <div key={widget.id} className="widget-card">
          <h4>{widget.title}</h4>
          <p className="widget-description">{widget.description}</p>
          <button onClick={() => onAddWidget(widget)}>Add Widget</button>
        </div>
      ))}
    </div>
  );
};

export default WidgetLibrary;