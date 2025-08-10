// src/components/WidgetLibrary.tsx
import React from 'react';
import './WidgetLibrary.css';

const WIDGET_CATALOG = [
  { id: 'kpi0', title: 'LTD Expensed (Custom)', defaultLayout: { w: 3, h: 3 } },
  {
    id: 'kpi5',
    title: 'Enrolled Patients % (Custom)',
    defaultLayout: { w: 3, h: 3 },
  },
  { id: 'kpi2', title: 'Trial budget', defaultLayout: { w: 3, h: 3 } },
  { id: 'kpi1', title: 'LTD Reconciled', defaultLayout: { w: 3, h: 3 } },
  { id: 'kpi4', title: '% Recognized', defaultLayout: { w: 3, h: 3 } },
  { id: 'chart1', title: 'LTD trial spend', defaultLayout: { w: 6, h: 8 } },
  { id: 'chart2', title: 'Actual + forecast', defaultLayout: { w: 6, h: 8 } },
  {
    id: 'chart7',
    title: 'Budget vs. Forecast (Custom)',
    defaultLayout: { w: 6, h: 8 },
  },
  {
    id: 'chart4',
    title: 'Budget vs forecast by cost category',
    defaultLayout: { w: 6, h: 8 },
  },
  {
    id: 'chart3',
    title: 'Cumulative total spend',
    defaultLayout: { w: 6, h: 8 },
  },
  { id: 'chart5', title: 'Vendor progress', defaultLayout: { w: 6, h: 8 } },
  { id: 'table1', title: 'Financial Summary', defaultLayout: { w: 12, h: 8 } },
  { id: 'embed', title: 'Embedded Content', defaultLayout: { w: 6, h: 8 } },
  { id: 'styled-embed', title: 'Styled Widget', defaultLayout: { w: 6, h: 8 } },
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
          <button onClick={() => onAddWidget(widget)}>Add</button>
        </div>
      ))}
    </div>
  );
};

export default WidgetLibrary;
