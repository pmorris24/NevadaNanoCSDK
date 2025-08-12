// src/theme.ts
import Highcharts from 'highcharts';

export const getHighchartsThemeOptions = (theme: 'light' | 'dark' | undefined): Highcharts.Options => {
    if (theme !== 'dark') {
      // Light Theme Options
      return {
        xAxis: {
          labels: { style: { color: '#333333' } },
          title: { style: { color: '#666666' } }
        },
        yAxis: {
          labels: { style: { color: '#333333' } },
          title: { style: { color: '#666666' } }
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#EAEBEF',
            style: {
                color: '#1A2B3C'
            }
        },
        legend: {
            itemStyle: { color: '#333333' },
            itemHoverStyle: { color: '#000000' },
            itemHiddenStyle: { color: '#cccccc' }
        }
      };
    }
  
    // Dark Theme Options
    return {
      colors: ['#8A8AFF', '#66DEFF', '#A5FF8A', '#BFBFFF', '#FF8A8A', '#FFB58A'],
      chart: {
        backgroundColor: '#2C2C2E',
      },
      title: { style: { color: '#E0E0E3' } },
      subtitle: { style: { color: '#E0E0E3' } },
      xAxis: {
        gridLineColor: '#707073',
        labels: { style: { color: '#E0E0E3' } },
        title: { style: { color: '#A0A0A3' } }
      },
      yAxis: {
        gridLineColor: '#444446',
        labels: { style: { color: '#E0E0E3' } },
        title: { style: { color: '#A0A0A3' } }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        style: { color: '#F0F0F0' },
        borderColor: '#333333',
      },
      legend: {
        itemStyle: { color: '#E0E0E3' },
        itemHoverStyle: { color: '#FFF' },
        itemHiddenStyle: { color: '#606063' }
      },
    };
};