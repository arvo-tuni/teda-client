import Chart from 'chart.js';

import { Colors } from '@/charts/common';

import { Directions } from '@server/statistics/types';

export default function saccadeAmplitudeRange(
  el: HTMLCanvasElement,
  data: Directions,
  ranges: number[],
  reference: Directions,
) {
  const datasets = [{
    label: 'forward',
    data: data.forward,
    backgroundColor: Colors.GREEN,
  }, {
    label: 'backward',
    data: data.backward,
    backgroundColor: Colors.RED,
  }];

  if (reference.forward) {
    datasets.push({
      label: 'mean forward',
      data: reference.forward,
      backgroundColor: Colors.REFERENCE_LIGHT,
    });
  }
  if (reference.backward) {
    datasets.push({
      label: 'mean backward',
      data: reference.backward,
      backgroundColor: Colors.REFERENCE_DARK,
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
