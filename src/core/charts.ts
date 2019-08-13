import Chart from 'chart.js';

import * as Transform from '@/core/transform';
import * as Format from '@/core/format';

import * as WebLog from '@server/web/log';
import * as TobiiLog from '@server/tobii/log';

const FIXATION_DURATION_RANGES = [ 150, 300, 500, 750, 1000, 1500, Number.MAX_VALUE ];
const SACCADE_AMPLITUDE_RANGES = [ 1, 2, 3.5, 7, Number.MAX_VALUE ];
const ANGLE_RANGE_COUNT = 8;
const TIME_RANGE_INTERVAL = 20;    // sec

const BG_PRIMARY = 'hsla(210, 90%, 50%, 0.7)';
const BG_PRIMARY_LIGHT = 'hsla(210, 90%, 50%, 0.2)';
const BG_SUCCESS = 'hsla(120, 100%, 50%, 0.3)';
const BG_DANGER = 'hsla(0, 100%, 50%, 0.3)';

interface SaccDirections {
  forward: number;
  backward: number;
  other: number;
}

export function hits( el: HTMLCanvasElement, data: any[] ) {
  const datasets: Array<{data: number[], label: string, backgroundColor: string}> = [];

  if (data[0].wrong !== undefined) {
    datasets.push({
      label: 'wrong',
      data: data.map( (item: WebLog.WrongAndCorrect) => item.wrong ),
      backgroundColor: BG_DANGER,
    });
    datasets.push({
      label: 'correct',
      data: data.map( (item: WebLog.WrongAndCorrect) => item.correct ),
      backgroundColor: BG_SUCCESS,
    });
  }
  else {
    datasets.push({
      label: 'total',
      data,
      backgroundColor: BG_PRIMARY,
    });
  }

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: datasets[0].data.map( (val: number, index: number) => `${(index + 1) * 10}%` ),
      datasets,
    },
  });
}

export function fixDurationsRange( el: HTMLCanvasElement, fixations: Transform.Fixation[] ) {
  const data = FIXATION_DURATION_RANGES.map( () => 0 );

  fixations.forEach( fix => {
    const rangeIndex = FIXATION_DURATION_RANGES.findIndex( maxDuration => fix.duration < maxDuration );
    data[ rangeIndex ] += 1;
  });

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: FIXATION_DURATION_RANGES.map( val => val < 10000 ? `< ${val} ms` : 'rest' ),
      datasets: [{
        label: 'fixations count',
        data,
        backgroundColor: BG_PRIMARY,
      }],
    },
  });
}

export function fixDurationsTime( el: HTMLCanvasElement, fixations: Transform.Fixation[] ) {
  const { data, rangeDuration } = makeTempRange<number, Transform.Fixation>(
    TIME_RANGE_INTERVAL,
    fixations,
    (rangeFixations: Transform.Fixation[]) => {
      return Math.round( Transform.averageDuration( rangeFixations ) );
    },
  );

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: data.map( (_, i) => Format.secToTime( (i + 1) * rangeDuration ) ),
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

export function saccadeDirections( el: HTMLCanvasElement, saccades: Transform.Saccade[] ) {
  const datasets: Array<{data: number[], label: string, backgroundColor: string}> = [];

  const { data, rangeDuration } = makeTempRange<SaccDirections, Transform.Saccade>(
    TIME_RANGE_INTERVAL,
    saccades,
    (rangeSaccades: Transform.Saccade[]) => {

      return rangeSaccades.reduce( (acc, sacc) => {
        if (315 < sacc.absoluteAngle || sacc.absoluteAngle < 45) {
          acc.forward++;
        }
        else if (135 < sacc.absoluteAngle && sacc.absoluteAngle < 225) {
          acc.backward++;
        }
        else {
          acc.other++;
        }
        return acc;
      }, {
        forward: 0,
        backward: 0,
        other: 0,
      } as SaccDirections );
    },
  );

  datasets.push({
    label: 'forward',
    data: data.map( (item: SaccDirections) => item.forward ),
    backgroundColor: BG_SUCCESS,
  });
  datasets.push({
    label: 'backward',
    data: data.map( (item: SaccDirections) => item.backward ),
    backgroundColor: BG_DANGER,
  });
  datasets.push({
    label: 'other',
    data: data.map( (item: SaccDirections) => item.other ),
    backgroundColor: BG_PRIMARY,
  });

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: data.map( (_, i) => Format.secToTime( (i + 1) * rangeDuration ) ),
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

export function saccadeDirectionRadar( el: HTMLCanvasElement, saccades: Transform.Saccade[] ) {

  const rangeItemAngle = 360 / ANGLE_RANGE_COUNT;

  // const data: number[] = new Array( ANGLE_RANGE_COUNT ).map( (v) => { console.log(v); return 0; } );
  const data: Array<{ label: string, value: number }> = [];
  for (let i = 0; i < ANGLE_RANGE_COUNT; i++) {
    data.push({
      label: `${i * 45}\u00b0`,
      value: 0,
    });
  }

  saccades.forEach( sacc => {
    let rangeIndex = Math.floor( (sacc.absoluteAngle + rangeItemAngle / 2) / rangeItemAngle );
    if (rangeIndex >= ANGLE_RANGE_COUNT) {
      rangeIndex = 0;
    }
    data[ rangeIndex ].value++;
  });

  // make the order of data so that 0 appears on the right, and degree inceases CCW
  data.reverse();
  data.unshift( ...data.splice( ANGLE_RANGE_COUNT - 3, 3 ) );

  return new Chart( el, {
    type: 'radar',
    data: {
      labels: data.map( item => item.label ),
      datasets: [{
        label: 'directions',
        data: data.map( item => item.value ),
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

export function saccadeAmplitudeRange( el: HTMLCanvasElement, saccades: Transform.Saccade[] ) {
  const dataForward = SACCADE_AMPLITUDE_RANGES.map( () => 0 );
  const dataBackward = SACCADE_AMPLITUDE_RANGES.map( () => 0 );

  saccades.forEach( sacc => {
    const rangeIndex = SACCADE_AMPLITUDE_RANGES.findIndex( maxAmplitude => sacc.amplitude < maxAmplitude );
    if (315 < sacc.absoluteAngle || sacc.absoluteAngle < 45) {
      dataForward[ rangeIndex ] += 1;
    }
    else if (135 < sacc.absoluteAngle && sacc.absoluteAngle < 225) {
      dataBackward[ rangeIndex ] += 1;
    }
  });

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: SACCADE_AMPLITUDE_RANGES.map( val => val < 10000 ? `< ${val}\u00b0` : 'rest' ),
      datasets: [{
        label: 'forward',
        data: dataForward,
        backgroundColor: BG_SUCCESS,
      }, {
        label: 'backward',
        data: dataBackward,
        backgroundColor: BG_DANGER,
      }],
    },
  });

}

export function saccadeAmplitudeTime( el: HTMLCanvasElement, saccades: Transform.Saccade[] ) {
  const { data, rangeDuration } = makeTempRange<number, Transform.Saccade>(
    TIME_RANGE_INTERVAL,
    saccades,
    (rangeSaccades: Transform.Saccade[]) => {
      return Transform.averageAmplitude( rangeSaccades );
    },
  );

  return new Chart( el, {
    type: 'bar',
    data: {
      labels: data.map( (_, i) => Format.secToTime( (i + 1) * rangeDuration ) ),
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

type Callback<T, U> = (items: U[]) => T;

function makeTempRange<T, U extends {timestamp: TobiiLog.Timestamp}>(
  rangeDuration: number,  // seconds
  timestamped: U[],
  cb: Callback<T, U> ): {data: T[], rangeDuration: number} {

  const end = timestamped.slice( -1 )[0].timestamp.EyeTrackerTimestamp;
  const start = timestamped[0].timestamp.EyeTrackerTimestamp;
  const duration = end - start;
  const rangeCount = Math.round( duration / (rangeDuration * 1000000) );
  const rangeItemDuration = (end - start) / rangeCount + 1;

  const data: T[] = [];

  let rangeMaxTimestamp = start + rangeItemDuration;
  let rangeItems: U[] = [];

  timestamped.forEach( item => {
    if (item.timestamp.EyeTrackerTimestamp > rangeMaxTimestamp) {
      rangeMaxTimestamp += rangeItemDuration;
      data.push( cb( rangeItems ) );
      rangeItems = [];
    }

    rangeItems.push( item );
  });

  data.push( cb( rangeItems ) );

  return {
    data,
    rangeDuration: rangeItemDuration / 1000000 };
}

