import React, { useCallback } from 'react';
import { DashboardWidget } from '@sisense/sdk-ui';
import Highcharts from 'highcharts';

interface BudgetVsForecastWidgetProps {
    themeMode: 'light' | 'dark';
}

const BudgetVsForecastWidget: React.FC<BudgetVsForecastWidgetProps> = ({ themeMode }) => {
    const widgetOid = '6865dfcbf8d1a5338388236e';
    const dashboardOid = '684ae8c995906e3edc558210';

    const onBeforeRender = useCallback((options: any): any => {
        const theme = themeMode;

        const getSeriesDataByName = (name: string) => {
            const series = options.series?.find((s: any) => s.name === name);
            if (!series || !(series as any).data) return [];
            return (series as any).data.map((point: any) => (typeof point === 'object' && point !== null ? point.y : point) || 0);
        };
        
        const categories = options.xAxis?.[0]?.categories || [];

        const ltdExpenseData = getSeriesDataByName('LTD reconciled');
        const remainingBudgetData = getSeriesDataByName('Remaining budget');
        const forecastedData = getSeriesDataByName('Forecasted');
        const contractedData = ltdExpenseData.map((ltd: number, index: number) => ltd + (remainingBudgetData[index] || 0));

        const ltdExpenseColor = theme === 'dark' ? '#8A8AFF' : 'rgb(29, 188, 168)';
        const contractedColor = theme === 'dark' ? 'rgba(138, 138, 255, 0.3)' : 'rgba(29, 188, 168, 0.3)';
        const contractedLegendColor = theme === 'dark' ? '#8A8AFF' : 'rgb(160, 219, 211)';
        const overContractColor = '#D32F2F';
        const underContractColor = '#4CAF50';

        let baseOptions: Highcharts.Options = {
            title: { text: '' },
            series: [
                { type: 'bar', name: 'Forecasted', data: forecastedData, visible: false, showInLegend: false },
                { type: 'line', name: 'Under contract', color: underContractColor, data: [], showInLegend: true, marker: { enabled: false } },
                { type: 'line', name: 'Over contract', color: overContractColor, data: [], showInLegend: true, marker: { enabled: false } },
                { type: 'bar', name: 'Contracted', color: contractedLegendColor, data: [], showInLegend: true },
                { name: 'Contracted_data', type: 'bar', data: contractedData, color: contractedColor, borderColor: ltdExpenseColor, borderWidth: 1, pointWidth: 40, zIndex: 0, states: { hover: { enabled: false } }, showInLegend: false },
                { name: 'LTD Expense', type: 'bar', data: ltdExpenseData, color: ltdExpenseColor, pointWidth: 20, zIndex: 1, showInLegend: true },
                {
                    name: 'Forecast Marker',
                    type: 'bar',
                    data: forecastedData.map((val: number, i: number) => ({
                        y: val,
                        color: (val - contractedData[i]) >= 0 ? overContractColor : underContractColor,
                    })),
                    pointWidth: 3,
                    grouping: false,
                    zIndex: 5,
                    showInLegend: false,
                }
            ],
            chart: { 
                type: 'bar',
                backgroundColor: 'transparent'
            },
            plotOptions: { bar: { grouping: false, borderWidth: 1, borderRadius: 2, dataLabels: { enabled: false } } },
            xAxis: [{
                categories: categories,
                title: { text: '' },
                gridLineWidth: 0,
                reversed: true,
                labels: {
                    align: 'right',
                    x: -10,
                    style: {
                        color: theme === 'dark' ? '#FFFFFF' : '#000000'
                    },
                }
            }],
            yAxis: [{
                title: { text: '' },
                type: 'logarithmic',
                min: 1,
                reversed: false,
                gridLineWidth: 1,
                gridLineColor: theme === 'dark' ? '#444446' : '#E0E0E0',
                labels: {
                     style: {
                        color: theme === 'dark' ? '#FFFFFF' : '#000000'
                     },
                     formatter: function(this: Highcharts.AxisLabelsFormatterContextObject) {
                         const value = this.value as number;
                         if (value >= 1000000000) return `$${value / 1000000000}B`;
                         if (value >= 1000000) return `$${value / 1000000}M`;
                         if (value >= 1000) return `$${value / 1000}K`;
                         return `$${value}`;
                     }
                },
            }],
            legend: { 
                enabled: true, 
                verticalAlign: 'top', 
                align: 'left', 
                x: 0, 
                y: -10, 
                reversed: true, 
                symbolRadius: 0, 
                symbolHeight: 12, 
                symbolWidth: 12,
                itemStyle: {
                    color: theme === 'dark' ? '#E0E0E3' : '#333333'
                }
            },
            tooltip: {
                enabled: true,
                shared: true,
                useHTML: true,
                backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 1)',
                borderColor: theme === 'dark' ? '#333333' : '#E0E0E0',
                formatter: function(this: any) {
                    try {
                        const points = Array.isArray(this.points) ? this.points : [];
                        if (!points.length || !points[0].point) return 'Error';
                        
                        const pointIndex = points[0].point.index;
                        if (typeof pointIndex === 'undefined') return 'Error';
    
                        const categoryName = categories?.[pointIndex] || 'Unknown Category';
                        const chart = points[0].series.chart;
    
                        const ltdExpenseSeries = chart?.series.find((s: any) => s.name === 'LTD Expense');
                        const contractedDataSeries = chart?.series.find((s: any) => s.name === 'Contracted_data');
                        const forecastedSeries = chart?.series.find((s: any) => s.name === 'Forecasted');
    
                        if (!ltdExpenseSeries || !contractedDataSeries || !forecastedSeries) { return 'A required data series is missing.'; }
    
                        const ltdExpenseValue = ((ltdExpenseSeries as any).data[pointIndex] as Highcharts.Point).y ?? 0;
                        const contractedValue = ((contractedDataSeries as any).data[pointIndex] as Highcharts.Point).y ?? 0;
                        const forecastedValue = ((forecastedSeries as any).data[pointIndex] as Highcharts.Point).y ?? 0;
    
                        const percentComplete = (contractedValue === 0) ? 0 : (ltdExpenseValue / contractedValue) * 100;
                        const overUnderValue = forecastedValue - contractedValue;
                        const overUnderPercent = (contractedValue === 0) ? 0 : (overUnderValue / contractedValue) * 100;
                        const currentOverUnderColor = overUnderValue >= 0 ? overContractColor : underContractColor;
    
                        const tooltipTextColor = theme === 'dark' ? '#F0F0F0' : '#333333';
                        let sHtml = `<div style="padding: 10px; min-width: 250px; font-family: 'lato', sans-serif; font-size: 13px; color: ${tooltipTextColor};">`;
                        sHtml += `<div style="font-size: 14px; margin-bottom: 10px; font-weight: 700;">${categoryName}</div>`;
                        sHtml += `<table style="width: 100%; color: ${tooltipTextColor};">`;
                        sHtml += `<tr><td style="padding: 6px 2px; font-weight: 400;"><span style="background-color: ${ltdExpenseColor}; width: 12px; height: 12px; border-radius: 2px; display: inline-block; margin-right: 8px; vertical-align: middle;"></span>LTD expense</td><td style="text-align: right; padding: 6px 2px; font-weight: 700;">$${(ltdExpenseValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td></tr>`;
                        sHtml += `<tr><td style="padding: 6px 2px; font-weight: 400;"><span style="background-color: ${contractedLegendColor}; width: 12px; height: 12px; border-radius: 2px; display: inline-block; margin-right: 8px; vertical-align: middle;"></span>Contracted</td><td style="text-align: right; padding: 6px 2px; font-weight: 700;">$${(contractedValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td></tr>`;
                        sHtml += `<tr><td style="padding: 6px 2px; font-weight: 400;"><span style="width: 10px; display: inline-block; margin-right: 8px; margin-left: 4px;"></span>% complete</td><td style="text-align: right; padding: 6px 2px; font-weight: 700;">${(percentComplete).toFixed(0)}%</td></tr>`;
                        sHtml += `<tr><td colspan="2" style="border-top: 1px solid #EEE; padding-top: 8px;"></td></tr>`;
                        sHtml += `<tr><td style="padding: 6px 2px; font-weight: 400;"><span style="background-color: ${currentOverUnderColor}; width: 3px; height: 12px; border-radius: 2px; display: inline-block; margin-right: 8px; vertical-align: middle; margin-left: 4px;"></span>Forecasted</td><td style="text-align: right; padding: 6px 2px; font-weight: 700;">$${(forecastedValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td></tr>`;
                        const formattedValue = (overUnderValue >= 0 ? '+' : '') + '$' + (Math.abs(overUnderValue)).toLocaleString(undefined, { maximumFractionDigits: 0 });
                        const formattedPercent = (overUnderValue >= 0 ? '+' : '') + (Math.abs(overUnderPercent)).toFixed(0) + '%';
                        sHtml += `<tr><td style="padding: 6px 2px; font-weight: 400;"><span style="width: 10px; display: inline-block; margin-right: 8px; margin-left: 4px;"></span>Over/under</td><td style="text-align: right; padding: 6px 2px; font-weight: 700; color: ${currentOverUnderColor};">${formattedValue}<span style="display: inline-block; background-color: ${currentOverUnderColor}20; color: ${currentOverUnderColor}; padding: 2px 5px; border-radius: 4px; margin-left: 8px;">${formattedPercent}</span></td></tr>`;
                        sHtml += '</table></div>';
                        return sHtml;
                    } catch (e) {
                        console.error('Error in tooltip formatter:', e);
                        return 'Error creating tooltip.';
                    }
                }
            }
        };

        return Highcharts.merge(options, baseOptions);
    }, [themeMode]);

    const styleOptions = {
        backgroundColor: themeMode === 'dark' ? '#1F2838' : '#FFFFFF',
        header: {
            backgroundColor: themeMode === 'dark' ? '#1F2838' : '#FFFFFF',
            titleTextColor: themeMode === 'dark' ? '#FFFFFF' : '#111827',
        }
    };
    
    return (
        <DashboardWidget
            key={themeMode}
            widgetOid={widgetOid}
            dashboardOid={dashboardOid}
            styleOptions={styleOptions}
            title="Budget vs. forecast per vendor"
            onBeforeRender={onBeforeRender}
        />
    );
};

export default BudgetVsForecastWidget;