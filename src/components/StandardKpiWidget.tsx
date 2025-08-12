// src/components/StandardKpiWidget.tsx
import React from 'react';
import { DashboardWidget } from '@sisense/sdk-ui';
import Highcharts from 'highcharts';
import { getHighchartsThemeOptions } from '../theme';
import './CustomWidget.css';

interface StandardKpiWidgetProps {
    title: string;
    widgetOid?: string;
    dashboardOid?: string;
}

const StandardKpiWidget: React.FC<StandardKpiWidgetProps> = ({ title, widgetOid, dashboardOid }) => {

    const onBeforeRender = (options: any) => {
        const theme = document.body.dataset.theme;
        const themeOptions = getHighchartsThemeOptions(theme);

        if (options.chart?.type === 'solidgauge' || options.chart?.type === 'pie') {
            themeOptions.pane = {
                background: [{
                    backgroundColor: theme === 'dark' ? '#3E3E42' : '#EEEEEE',
                    borderWidth: 0,
                    outerRadius: '100%',
                    innerRadius: '80%',
                }],
            };
            themeOptions.plotOptions = {
                ...themeOptions.plotOptions,
                solidgauge: {
                    ...themeOptions.plotOptions?.solidgauge,
                    dataLabels: {
                        enabled: false
                    },
                    rounded: true
                }
            }
        }

        return Highcharts.merge(options, themeOptions);
    };

    const styleOptions = {
        header: { hidden: true },
        indicator: {
            textColor: 'var(--text-primary)',
            title: {
                textColor: 'var(--text-secondary)'
            }
        },
    };
    
    if (!widgetOid || !dashboardOid) {
        return <div className="widget-error">Widget OID not configured.</div>;
    }

    return (
        <div className="custom-kpi-widget">
            <h3 className="widget-title">{title}</h3>
            <div className="custom-widget-content kpi-content">
                <DashboardWidget
                    widgetOid={widgetOid}
                    dashboardOid={dashboardOid}
                    styleOptions={styleOptions}
                    onBeforeRender={onBeforeRender}
                />
            </div>
        </div>
    );
};

export default StandardKpiWidget;