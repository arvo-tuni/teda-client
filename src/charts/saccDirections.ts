import Chart from 'chart.js';

import { Colors } from '@/charts/common';
import { secToTime } from '@/core/format';

import { Directions } from '@server/statistics/types';

export default function saccadeDirections(
  el: HTMLCanvasElement,
  data: Directions,
  reference: Directions,
) {
  const datasets: Chart.ChartDataSets[] = [];

  datasets.push({
    label: 'forward',
    data: data.forward,
    backgroundColor: Colors.GREEN,
  } as Chart.ChartDataSets);

  datasets.push({
    label: 'backward',
    data: data.backward,
    backgroundColor: Colors.RED,
  } as Chart.ChartDataSets);

  if (data.other) {
    datasets.push({
      label: 'other',
      data: data.other,
      backgroundColor: Colors.BLUE,
    } as Chart.ChartDataSets);
  }

  if (reference.forward) {
    datasets.push({
      type: 'line',
      fill: false,
      label: 'mean forward',
      data: reference.forward,
      backgroundColor: Colors.REFERENCE_LIGHT,
    } as Chart.ChartDataSets);
  }
  if (reference.backward) {
    datasets.push({
      type: 'line',
      fill: false,
      label: 'mean backward',
      data: reference.backward,
      backgroundColor: Colors.REFERENCE_LIGHT,
    } as Chart.ChartDataSets);
  }
  if (reference.other) {
    datasets.push({
      type: 'line',
      fill: false,
      label: 'mean other',
      data: reference.other,
      backgroundColor: Colors.REFERENCE_LIGHT,
    } as Chart.ChartDataSets);
  }

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: data.forward.map( (_, i) => secToTime( (i + 1) * data.itemDuration ) ),
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
          filter: item => item.hidden = item.datasetIndex as number <= 2,
        },
      },
    },
  });
}
