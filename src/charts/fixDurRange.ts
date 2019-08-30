import Chart from 'chart.js';

import { Colors, References } from '@/charts/common';

export default function fixDurationsRange(
  el: HTMLCanvasElement,
  data: number[],
  ranges: number[],
  reference: References<number[]>,
) {
  const datasets = [{
    label: 'fixations count',
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
      labels: ranges.map( val => val < 10000 ? `< ${val} ms` : 'rest' ),
      datasets,
    },
  });
}
