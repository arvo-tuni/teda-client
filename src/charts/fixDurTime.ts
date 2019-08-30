import Chart from 'chart.js';

import { Colors, References } from '@/charts/common';
import { secToTime } from '@/core/format';

export default function fixDurationsTime(
  el: HTMLCanvasElement,
  data: number[],
  itemDuration: number,
  reference: References<number[]>,
) {
  const datasets = [{
    label: 'average duration, ms',
    data,
    backgroundColor: Colors.BLUE,
  } as Chart.ChartDataSets];

  if (reference.means) {
    datasets.push({
      label: 'reference',
      data: reference.means,
      backgroundColor: Colors.REFERENCE_LIGHT,
    } as Chart.ChartDataSets);
  }

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: data.map( (_, i) => secToTime( (i + 1) * itemDuration ) ),
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
