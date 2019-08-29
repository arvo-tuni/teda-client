import Chart from 'chart.js';

import * as Transform from '@/core/transform';
import * as Format from '@/core/format';

import * as Statistics from '@server/statistics/types';
import { WrongAndCorrect } from '@server/web/log';

const BG_PRIMARY = 'hsla(210, 90%, 50%, 0.7)';
const BG_PRIMARY_LIGHT = 'hsla(210, 90%, 50%, 0.2)';
const BG_SUCCESS = 'hsla(120, 100%, 50%, 0.3)';
const BG_DANGER = 'hsla(0, 100%, 50%, 0.3)';
const BG_LINE5 = 'hsla(30, 100%, 50%, 0.3)';
const BG_LINE6 = 'hsla(130, 100%, 50%, 0.3)';
const BG_REFERENCE_MEAN = 'hsla(0, 0%, 70%, 0.3)';
const BG_REFERENCE_BORDER = 'hsla(0, 0%, 30%, 0.3)';

export interface References<T> {
  means?: T;
  medians?: T;
  upperQuantile?: T;
  lowerQuantile?: T;
}

interface ChartDataExt extends Chart.ChartData {
  name?: string;
  value?: string;
}

interface UserEvents {
  [x: string]: Transform.TimedEvent[];
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
  instruction: BG_PRIMARY,
  drawing: BG_SUCCESS,
  sphere: BG_LINE5,
  cross: BG_LINE6,
};

Chart.defaults.global.animation = { duration: 0 };

export function hits(
  el: HTMLCanvasElement,
  data: Statistics.Hits,
  reference: Statistics.Hits,
) {
  const datasets = [{
      label: 'correct',
      data: data.correct,
      backgroundColor: BG_SUCCESS,
    }, {
      label: 'wrong',
      data: data.wrong,
      backgroundColor: BG_DANGER,
    },
  ];

  if (reference.correct) {
    datasets.push({
      label: 'mean correct',
      data: reference.correct,
      backgroundColor: BG_REFERENCE_MEAN,
    });
  }
  if (reference.wrong) {
    datasets.push({
      label: 'mean wrong',
      data: reference.wrong,
      backgroundColor: BG_REFERENCE_BORDER,
    });
  }

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: data.correct.map( (val: number, index: number) => `${(index + 1) * 10}%` ),
      datasets,
    },
  });
}

export function userEvents( el: HTMLCanvasElement, events: UserEvents ) {
  const datasets: Chart.ChartDataSets[] = [];

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

export function fixDurationsRange(
  el: HTMLCanvasElement,
  data: number[],
  ranges: number[],
  reference: References<number[]>,
) {
  const datasets = [{
    label: 'fixations count',
    data,
    backgroundColor: BG_PRIMARY,
  }];

  if (reference.means) {
    datasets.push({
      label: 'reference',
      data: reference.means,
      backgroundColor: BG_REFERENCE_MEAN,
    });
  }

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: ranges.map( val => val < 10000 ? `< ${val} ms` : 'rest' ),
      datasets,
    },
  });
}

export function fixDurationsTime(
  el: HTMLCanvasElement,
  data: number[],
  itemDuration: number,
  reference: References<number[]>,
) {
  const datasets = [{
    label: 'average duration, ms',
    data,
    backgroundColor: BG_PRIMARY,
  } as Chart.ChartDataSets];

  if (reference.means) {
    datasets.push({
      label: 'reference',
      data: reference.means,
      backgroundColor: BG_REFERENCE_MEAN,
    } as Chart.ChartDataSets);
  }

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: data.map( (_, i) => Format.secToTime( (i + 1) * itemDuration ) ),
      datasets,
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

export function saccadeDirections(
  el: HTMLCanvasElement,
  data: Statistics.Directions,
  reference: Statistics.Directions,
) {
  const datasets: Chart.ChartDataSets[] = [];

  datasets.push({
    label: 'forward',
    data: data.forward,
    backgroundColor: BG_SUCCESS,
  } as Chart.ChartDataSets);
  datasets.push({
    label: 'backward',
    data: data.backward,
    backgroundColor: BG_DANGER,
  } as Chart.ChartDataSets);

  if (data.other) {
    datasets.push({
      label: 'other',
      data: data.other,
      backgroundColor: BG_PRIMARY,
    } as Chart.ChartDataSets);
  }

  if (reference.forward) {
    datasets.push({
      type: 'line',
      fill: false,
      label: 'mean forward',
      data: reference.forward,
      backgroundColor: BG_REFERENCE_MEAN,
    } as Chart.ChartDataSets);
  }
  if (reference.backward) {
    datasets.push({
      type: 'line',
      fill: false,
      label: 'mean backward',
      data: reference.backward,
      backgroundColor: BG_REFERENCE_MEAN,
    } as Chart.ChartDataSets);
  }
  if (reference.other) {
    datasets.push({
      type: 'line',
      fill: false,
      label: 'mean other',
      data: reference.other,
      backgroundColor: BG_REFERENCE_MEAN,
    } as Chart.ChartDataSets);
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
      legend: {
        labels: {
          filter: item => item.hidden = item.datasetIndex <= 2,
        },
      },
    },
  });
}

export function saccadeDirectionRadar(
  el: HTMLCanvasElement,
  data: Statistics.Angles,
  reference: References<Statistics.Angles>,
) {
  const rotatedData = Object.keys( data ).map( key => { return {
      angle: +key,
      label: `${key}\u00b0`,
      value: data[ +key ],
    };
  });

  // make the order of data so that 0 appears on the right, and degree inceases CCW
  rotatedData.reverse();
  rotatedData.unshift( ...rotatedData.splice( rotatedData.length - 3, 3 ) );

  const datasets = [{
    label: 'directions',
    data: rotatedData.map( item => item.value ),
    backgroundColor: BG_PRIMARY_LIGHT,
    borderColor: BG_PRIMARY,
  } as Chart.ChartDataSets ];

  if (reference.means) {
    datasets.push({
      label: 'reference',
      data: rotatedData.map( item => (reference.means as any)[ item.angle ] ),
      backgroundColor: BG_REFERENCE_MEAN,
      borderColor: BG_REFERENCE_BORDER,
    } as Chart.ChartDataSets );
  }

  return new Chart( el, {
    type: 'radar',
    data: {
      labels: rotatedData.map( item => item.label ),
      datasets,
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

export function saccadeAmplitudeRange(
  el: HTMLCanvasElement,
  data: Statistics.Directions,
  ranges: number[],
  reference: Statistics.Directions,
) {
  const datasets = [{
    label: 'forward',
    data: data.forward,
    backgroundColor: BG_SUCCESS,
  }, {
    label: 'backward',
    data: data.backward,
    backgroundColor: BG_DANGER,
  }];

  if (reference.forward) {
    datasets.push({
      label: 'mean forward',
      data: reference.forward,
      backgroundColor: BG_REFERENCE_MEAN,
    });
  }
  if (reference.backward) {
    datasets.push({
      label: 'mean backward',
      data: reference.backward,
      backgroundColor: BG_REFERENCE_BORDER,
    });
  }

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: ranges.map( val => val < 10000 ? `< ${val}\u00b0` : 'rest' ),
      datasets,
    },
  });
}

export function saccadeAmplitudeTime(
  el: HTMLCanvasElement,
  data: number[],
  itemDuration: number,
  reference: References<number[]>,
) {
  const datasets = [{
    label: 'average amplitude, deg',
    data,
    backgroundColor: BG_PRIMARY,
  }];

  if (reference.means) {
    datasets.push({
      label: 'reference',
      data: reference.means,
      backgroundColor: BG_REFERENCE_MEAN,
    });
  }

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: data.map( (_, i) => Format.secToTime( (i + 1) * itemDuration ) ),
      datasets,
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
