import Chart, { ChartPoint } from 'chart.js';

import * as Transform from '@/core/transform';
import * as Format from '@/core/format';

import * as Statistics from '@server/statistics/types';

const BG_PRIMARY = 'hsla(210, 90%, 50%, 0.7)';
const BG_PRIMARY_LIGHT = 'hsla(210, 90%, 50%, 0.2)';
const BG_SUCCESS = 'hsla(120, 100%, 50%, 0.3)';
const BG_DANGER = 'hsla(0, 100%, 50%, 0.3)';

interface ChartDataExt extends Chart.ChartData {
  name?: string;
  value?: string;
}

interface EventColor {
  [key: string]: string;
}
const EVENT_COLOR: EventColor = {
  navigate: BG_PRIMARY,
  data: BG_SUCCESS,
  ui: BG_DANGER,
  clicks: BG_PRIMARY_LIGHT,
  scrolls: BG_PRIMARY,
};

export function hits( el: HTMLCanvasElement, data: Statistics.Hits ) {
  return new Chart( el, {
    type: 'bar',
    data: {
      labels: data.correct.map( (val: number, index: number) => `${(index + 1) * 10}%` ),
      datasets: [
        {
          label: 'correct',
          data: data.correct,
          backgroundColor: BG_SUCCESS,
        },
        {
          label: 'wrong',
          data: data.wrong,
          backgroundColor: BG_DANGER,
        },
      ],
    },
  });
}

export function userEvents(
  el: HTMLCanvasElement,
  veroEvents: Transform.VeroEvents,
  clicks: Transform.TimedEvent[],
  scrolls: Transform.TimedEvent[],
) {
  const datasets: Chart.ChartDataSets[] = [];

  const events = {
    clicks,
    scrolls,
    ...veroEvents,
  };

  let index = 0;
  Object.keys( events ).forEach( key => {
    const data = (events as any)[ key ] as Transform.TimedEvent[];
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
            return `${dataset.label}:${nameStr}${valStr}, ${Format.secToTime( +(tooltipItem.label as string) )}`;
          },
        },
      },
      scales: {
        xAxes: [{
          ticks: {
            beginAtZero: true,
            callback: value => Format.secToTime( value ),
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

export function fixDurationsRange( el: HTMLCanvasElement, data: number[], ranges: number[] ) {
  return new Chart( el, {
    type: 'bar',
    data: {
      labels: ranges.map( val => val < 10000 ? `< ${val} ms` : 'rest' ),
      datasets: [{
        label: 'fixations count',
        data,
        backgroundColor: BG_PRIMARY,
      }],
    },
  });
}

export function fixDurationsTime( el: HTMLCanvasElement, data: number[], itemDuration: number ) {
  return new Chart( el, {
    type: 'bar',
    data: {
      labels: data.map( (_, i) => Format.secToTime( (i + 1) * itemDuration ) ),
      datasets: [{
        label: 'average duration, ms',
        data,
        backgroundColor: BG_PRIMARY,
      }],
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            min: 0,
          },
        }],
      },
    },
  });
}

export function saccadeDirections( el: HTMLCanvasElement, data: Statistics.Directions ) {
  const datasets: Chart.ChartDataSets[] = [];

  datasets.push({
    label: 'forward',
    data: data.forward,
    backgroundColor: BG_SUCCESS,
  });
  datasets.push({
    label: 'backward',
    data: data.backward,
    backgroundColor: BG_DANGER,
  });

  if (data.other) {
    datasets.push({
      label: 'other',
      data: data.other,
      backgroundColor: BG_PRIMARY,
    });
  }

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: data.forward.map( (_, i) => Format.secToTime( (i + 1) * data.itemDuration ) ),
      datasets,
    },
    options: {
      scales: {
        xAxes: [{
          stacked: true,
        }],
        yAxes: [{
          stacked: true,
        }],
      },
    },
  });
}

export function saccadeDirectionRadar( el: HTMLCanvasElement, data: Statistics.Angles ) {

  const rotatedData = Object.keys( data ).map( key => { return {
      label: `${key}\u00b0`,
      value: data[ +key ],
    };
  });

  // make the order of data so that 0 appears on the right, and degree inceases CCW
  rotatedData.reverse();
  rotatedData.unshift( ...rotatedData.splice( rotatedData.length - 3, 3 ) );

  return new Chart( el, {
    type: 'radar',
    data: {
      labels: rotatedData.map( item => item.label ),
      datasets: [{
        label: 'directions',
        data: rotatedData.map( item => item.value ),
        backgroundColor: BG_PRIMARY_LIGHT,
        borderColor: BG_PRIMARY,
      }],
    },
    options: {
      scale: {
        ticks: {
          display: false,
        },
      },
    },
  });
}

export function saccadeAmplitudeRange( el: HTMLCanvasElement, data: Statistics.Directions, ranges: number[] ) {

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: ranges.map( val => val < 10000 ? `< ${val}\u00b0` : 'rest' ),
      datasets: [{
        label: 'forward',
        data: data.forward,
        backgroundColor: BG_SUCCESS,
      }, {
        label: 'backward',
        data: data.backward,
        backgroundColor: BG_DANGER,
      }],
    },
  });
}

export function saccadeAmplitudeTime( el: HTMLCanvasElement, data: number[], itemDuration: number ) {

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: data.map( (_, i) => Format.secToTime( (i + 1) * itemDuration ) ),
      datasets: [{
        label: 'average amplitude, deg',
        data,
        backgroundColor: BG_PRIMARY,
      }],
    },
    options: {
      tooltips: {
        callbacks: {
          label: tooltipItem => {
            return `average amplitude ${(+(tooltipItem.value as string)).toFixed( 1 )}\u00b0`;
          },
        },
      },
      scales: {
        yAxes: [{
          ticks: {
            min: 0,
          },
        }],
      },
    },
  });
}
