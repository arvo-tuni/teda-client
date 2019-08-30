import Chart from 'chart.js';

import { Colors, References } from '@/charts/common';

import { Angles } from '@server/statistics/types';

export default function saccadeRadar(
  el: HTMLCanvasElement,
  data: Angles,
  reference: References<Angles>,
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
    backgroundColor: Colors.LIGHT_BLUE,
    borderColor: Colors.BLUE,
  } as Chart.ChartDataSets ];

  if (reference.means) {
    datasets.push({
      label: 'reference',
      data: rotatedData.map( item => (reference.means as any)[ item.angle ] ),
      backgroundColor: Colors.REFERENCE_LIGHT,
      borderColor: Colors.REFERENCE_DARK,
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
