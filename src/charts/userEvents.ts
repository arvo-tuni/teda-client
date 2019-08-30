import Chart from 'chart.js';

import { Colors } from '@/charts/common';

import { TimedEvent } from '@/core/transform';
import { secToTime } from '@/core/format';

interface ChartDataExt extends Chart.ChartData {
  name?: string;
  value?: string;
}

interface UserEvents {
  [x: string]: TimedEvent[];
}

interface EventColor {
  [key: string]: string;
}

const EVENT_COLOR: EventColor = {
  navigate: Colors.BLUE,
  data: Colors.GREEN,
  ui: Colors.RED,
  clicks: Colors.LIGHT_BLUE,
  scrolls: Colors.BLUE,
};

export default function userEvents( el: HTMLCanvasElement, events: UserEvents ) {
  const datasets: Chart.ChartDataSets[] = [];

  let index = 0;
  Object.keys( events ).forEach( key => {
    const data = (events as any)[ key ] as TimedEvent[];
    if (!data || data.length === 0) {
      return;
    }

    datasets.push({
      label: key,
      pointRadius: 7,
      pointHoverRadius: 9,
      showLine: false,
      data: data.map( item => { return {
        x: item.timestamp / 1000,
        y: index + 1,
        name: item.name,
        value: item.value,
      }; }),
      backgroundColor: EVENT_COLOR[ key ],
    });

    index++;
  });

  return new Chart( el, {
    type: 'scatter',
    data: {
      labels: (datasets[0].data as Chart.ChartData[]).map( _ => '' ),
      datasets,
    },
    options: {
      tooltips: {
        callbacks: {
          label: (tooltipItem, data) => {
            const dataset = (data.datasets as Chart.ChartDataSets[])[ tooltipItem.datasetIndex || 0];
            const values = dataset.data as ChartDataExt[];
            const { name, value } = values[ tooltipItem.index || 0];
            const nameStr = name ? ` "${name}"` : '';
            const valStr = value !== undefined ? ` = [${value}]` : '';
            return `${dataset.label}:${nameStr}${valStr}, ${secToTime( +(tooltipItem.label as string) )}`;
          },
        },
      },
      scales: {
        xAxes: [{
          ticks: {
            beginAtZero: true,
            callback: value => secToTime( value ),
          },
        }],
        yAxes: [{
          ticks: {
            min: 0.5,
            max: index + 0.5,
            stepSize: 1,
            callback: value => datasets[ value - 1 ] ? datasets[ value - 1 ].label as string : '',
          },
        }],
      },
    },
  });
}
