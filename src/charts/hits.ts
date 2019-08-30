import Chart from 'chart.js';

import { Colors } from '@/charts/common';

import { Hits } from '@server/statistics/types';

export default function hits(
  el: HTMLCanvasElement,
  data: Hits,
  reference: Hits,
) {
  const datasets = [{
      label: 'correct',
      data: data.correct,
      backgroundColor: Colors.GREEN,
    }, {
      label: 'wrong',
      data: data.wrong,
      backgroundColor: Colors.RED,
    },
  ];

  if (reference.correct) {
    datasets.push({
      label: 'mean correct',
      data: reference.correct,
      backgroundColor: Colors.REFERENCE_LIGHT,
    });
  }
  if (reference.wrong) {
    datasets.push({
      label: 'mean wrong',
      data: reference.wrong,
      backgroundColor: Colors.REFERENCE_DARK,
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
