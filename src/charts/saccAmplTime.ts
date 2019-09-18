import Chart from 'chart.js';

import { Colors, References } from '@/charts/common';
import { secToTime } from '@/core/format';

export default function saccadeAmplitudeTime(
  el: HTMLCanvasElement,
  data: number[],
  itemDuration: number,
  reference: References<number[]>,
) {
  const datasets = [{
    label: 'average amplitude, deg',
    data,
    backgroundColor: Colors.BLUE,
  }];

  if (reference.means) {
    datasets.push({
      label: 'reference',
      data: reference.means,
      backgroundColor: Colors.REFERENCE_LIGHT,
    });
  }

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: data.map( (_, i) => secToTime( (i + 1) * itemDuration ) ),
      datasets,
    },
    options: {
      tooltips: {
        callbacks: {
          label: tooltipItem => {
            return `average amplitude ${(+tooltipItem.value!).toFixed( 1 )}\u00b0`;
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
