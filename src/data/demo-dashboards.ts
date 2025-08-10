// src/data/demo-dashboards.ts
import { type Layout } from 'react-grid-layout';
import { type Folder, type Dashboard } from '../components/SidePanel';

const DEMO_DASHBOARD_LAYOUT: Layout[] = [
  { i: 'kpi0-0', x: 0, y: 0, w: 2, h: 2 },
  { i: 'kpi5-1', x: 2, y: 0, w: 2, h: 2 },
  { i: 'kpi2-2', x: 4, y: 0, w: 2, h: 2 },
  { i: 'kpi1-3', x: 6, y: 0, w: 2, h: 2 },
  { i: 'kpi4-4', x: 8, y: 0, w: 4, h: 2 },
  { i: 'chart1-5', x: 0, y: 2, w: 6, h: 8 },
  { i: 'chart2-6', x: 6, y: 2, w: 6, h: 8 },
  { i: 'chart7-7', x: 0, y: 10, w: 3, h: 8 },
  { i: 'chart4-8', x: 3, y: 10, w: 3, h: 8 },
  { i: 'chart3-9', x: 6, y: 10, w: 3, h: 8 },
  { i: 'chart5-10', x: 9, y: 10, w: 3, h: 8 },
  { i: 'table1-11', x: 0, y: 18, w: 12, h: 8 },
];

const demoWidgetInstances = DEMO_DASHBOARD_LAYOUT.map(layout => ({
    instanceId: layout.i,
    id: layout.i.split('-')[0],
    layout,
}));

export const DEMO_DATA: { folders: Folder[], dashboards: Dashboard[] } = {
    folders: [
        { id: 'f-patricks-folder', name: "Patrick's Folder", color: '#FF9800' },
    ],
    dashboards: [
        {
            id: 'd-demo-dark',
            name: 'Demo - Dark Mode',
            folderId: 'f-patricks-folder',
            widgetInstances: demoWidgetInstances,
            theme: 'dark',
        },
        {
            id: 'd-demo-light',
            name: 'Demo - Light Mode',
            folderId: 'f-patricks-folder',
            widgetInstances: demoWidgetInstances,
            theme: 'light',
        },
        {
            id: 'd-fusion-design',
            name: 'Fusion - Design',
            folderId: 'f-patricks-folder',
            iframeUrl: 'https://aesandbox.sisensepoc.com/app/main/dashboards/684ae8c995906e3edc558210?embed=true&edit=true&l=true&t=true&theme=686bda28ec0f76001ce41e6b'
        },
        {
            id: 'd-fusion-viewer',
            name: 'Fusion - Viewer',
            folderId: 'f-patricks-folder',
            iframeUrl: 'https://aesandbox.sisensepoc.com/app/main/dashboards/684ae8c995906e3edc558210?embed=true&r=false'
        }
    ]
};