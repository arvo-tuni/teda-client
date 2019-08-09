import Chart from 'chart.js';

import * as Transform from '@/core/transform';
import * as Format from '@/core/format';

import * as WebLog from '@server/web/log';

const DURATION_RANGES = [ 150, 300, 500, 750, 1000, 1500, Number.MAX_VALUE ];
const FIX_DURATION_RANGE = 20;    // sec

export function hits( el: HTMLCanvasElement, data: any[] ) {
  const datasets: Array<{data: number[], label: string, backgroundColor: string}> = [];

  if (data[0].wrong !== undefined) {
    datasets.push({
      label: 'wrong',
      data: data.map( (item: WebLog.WrongAndCorrect) => item.wrong ),
      backgroundColor: 'rgba(255, 0, 0, 0.3)',
    });
    datasets.push({
      label: 'correct',
      data: data.map( (item: WebLog.WrongAndCorrect) => item.correct ),
      backgroundColor: 'rgba(0, 255, 0, 0.3)',
    });
  }
  else {
    datasets.push({
      label: 'total',
      data,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    });
  }

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: datasets[0].data.map( (val: number, index: number) => `${(index + 1) * 10}%` ),
      datasets,
    },
    // options: {
    //   scales: {
    //     yAxes: [{
    //       ticks: {
    //         max: this.properties.maxHistPerTenth + 2,
    //       },
    //     }],
    //   },
    // },
  });
}

export function fixDurations( el: HTMLCanvasElement, fixations: Transform.Fixation[] ) {
  const data = DURATION_RANGES.map( () => 0 );

  fixations.forEach( fix => {
    const rangeIndex = DURATION_RANGES.findIndex( maxDuration => fix.duration < maxDuration );
    data[ rangeIndex ] += 1;
  });

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: DURATION_RANGES.map( val => val < 10000 ? `< ${val} ms` : 'rest' ),
      datasets: [{
        label: 'fixations count',
        data,
        backgroundColor: 'hsla(210, 90%, 50%, 0.7)',
      }],
    },
    // options: {
    //   scales: {
    //     yAxes: [{
    //       ticks: {
    //         max: this.properties.maxHistPerTenth + 2,
    //       },
    //     }],
    //   },
    // },
  });
}

export function tempAvgFixDur( el: HTMLCanvasElement, fixations: Transform.Fixation[] ) {
  const lastFixTimestamp = fixations.slice( -1 )[0].timestamp.EyeTrackerTimestamp;
  const firstFixTimestamp = fixations[0].timestamp.EyeTrackerTimestamp;
  const duration = lastFixTimestamp - firstFixTimestamp;
  const rangeCount = Math.round( duration / (FIX_DURATION_RANGE * 1000000) );
  const rangeItemDuration = (lastFixTimestamp - firstFixTimestamp) / rangeCount + 1;

  const data = new Array( rangeCount ).map( () => 0 );

  let rangeIndex = 0;
  let rangeMaxTimestamp = firstFixTimestamp + rangeItemDuration;
  let rangeFixations: Transform.Fixation[] = [];

  fixations.forEach( fix => {
    if (fix.timestamp.EyeTrackerTimestamp > rangeMaxTimestamp) {
      rangeMaxTimestamp += rangeItemDuration;
      data[ rangeIndex++ ] = Math.round( Transform.averageDuration( rangeFixations ) );
      rangeFixations = [];
    }

    rangeFixations.push( fix );
  });

  data[ rangeIndex ] = Math.round( Transform.averageDuration( rangeFixations ) );

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: data.map( (_, i) => Format.secToTime((i + 1) * (rangeItemDuration / 1000000)) ),
      datasets: [{
        label: 'average duration, ms',
        data,
        backgroundColor: 'hsla(210, 90%, 50%, 0.7)',
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

