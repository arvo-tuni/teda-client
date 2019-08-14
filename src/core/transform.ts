import * as Defs from '@/core/decl';

import * as WebLog from '@server/web/log';
import * as GazeEvent from '@server/tobii/gaze-event';
import { Timestamp } from '@server/tobii/log';

export interface Fixation {
  timestamp: Timestamp;
  x: number;
  y: number;
  duration: number;
}

export interface Saccade {
  timestamp: Timestamp;
  amplitude: number;
  absoluteAngle: number;
  relativeAngle: number;
}

export class TimedVeroEvent {
  timestamp: number;
  name: string;
  value: string;

  constructor( timestamp: number, name: string, value: string ) {
    this.timestamp = timestamp;
    this.name = name;
    this.value = value;
  }
}

export interface VeroEvents {
  nav: TimedVeroEvent[];
  data: TimedVeroEvent[];
  ui: TimedVeroEvent[];
}

export function meta( metaExt: Defs.TrialMetaExt ): Defs.TrialMetaExt {
  if (typeof metaExt.startTime === 'string') {
    metaExt.startTime = new Date( metaExt.startTime );
  }
  if (typeof metaExt.endTime === 'string') {
    metaExt.endTime = new Date( metaExt.endTime );
  }

  return metaExt;
}

export function events( evts: WebLog.TestEvent[] ): WebLog.TestEvent[] {
  evts.forEach( e => {
    if (typeof e.timestamp === 'string') {
      e.timestamp = new Date( e.timestamp );
    }
  });

  return evts;
}

export function fixations( data: GazeEvent.Fixation[], evts: WebLog.TestEvent[] ): Fixation[]  {
  const scrolls = evts.filter( event => event.type === 'scroll' ) as WebLog.TestEventScroll[];

  let scrollPosition = 0;
  let nextScroll: WebLog.TestEventScroll | null = scrolls.length > 0 ? scrolls[0] : null;
  let scrollIndex = 1;

  return data.map( fix => {

    while (nextScroll && nextScroll.timestamp < fix.timestamp.LocalTimeStamp) {
      scrollPosition = nextScroll.position;
      nextScroll = scrollIndex < scrolls.length ? scrolls[ scrollIndex++ ] : null;
    }

    return {
      timestamp: fix.timestamp,
      x: fix.x,
      y: fix.y + scrollPosition,
      duration: fix.duration,
    };
  });
}

export function saccades( data: GazeEvent.Fixation[] ): Saccade[]  {
  // let prevFix: GazeEvent.Fixation | null = null;
  // let prevAngle = 0;

  return data.map( fix => {
    return {
      timestamp: fix.timestamp,
      amplitude: fix.saccadicAmplitude,
      absoluteAngle: fix.absoluteSaccadicDirection,
      relativeAngle: fix.relativeSaccadicDirection,
    };

    // let amplitude = fix.saccadicAmplitude;
    // let absoluteAngle = fix.absoluteSaccadicDirection;
    // let relativeAngle = fix.relativeSaccadicDirection;

    // if (prevFix) {
    //   const dx = fix.x - prevFix.x;
    //   const dy = fix.y - prevFix.y;
    //   amplitude = Math.sqrt( dx * dx + dy * dy );
    //   absoluteAngle = angle0_360( Math.atan2( -dy, dx ) * 180 / Math.PI );
    //   relativeAngle = angle0_360( absoluteAngle - prevAngle );

    //   prevAngle = absoluteAngle;
    // }

    // prevFix = fix;

    // return {
    //   timestamp: fix.timestamp,
    //   amplitude,
    //   absoluteAngle,
    //   relativeAngle,
    // };
  });
}

export function averageDuration( data: Fixation[] ): number {
  if (data.length === 0) {
    return 0;
  }
  else {
    return data.reduce( (acc, fix) => acc += fix.duration, 0 ) / fixations.length;
  }
}

export function averageAmplitude( data: Saccade[] ): number {
  if (data.length === 0) {
    return 0;
  }
  else {
    return data.reduce( (acc, sacc) => acc += sacc.amplitude, 0 ) / saccades.length;
  }
}

export function veroEvents( evts: WebLog.TestEvent[], startTime: Date ): VeroEvents {
  const start = startTime.valueOf();

  const nav = evts.filter( e => e.type === 'veroNavigation' ) as WebLog.TestEventVeroNav[];
  const data = evts.filter( e => e.type === 'veroNavigationData' ) as WebLog.TestEventVeroNavData[];
  const ui = evts.filter( e => e.type === 'uiAdjustment' ) as WebLog.TestEventVeroUI[];

  return {
    nav: nav.map( item => new TimedVeroEvent( item.timestamp.valueOf() - start, item.target, '' ) ),
    data: data.map( item => new TimedVeroEvent( item.timestamp.valueOf() - start, item.variable, item.value ) ),
    ui: ui.map( item => new TimedVeroEvent( item.timestamp.valueOf() - start, item.target, item.enable ) ),
  };

  // return {
  //   nav: events.filter( e => e.type === 'veroNavigation' ) as WebLog.TestEventVeroNav[],
  //   data: events.filter( e => e.type === 'veroNavigationData' ) as WebLog.TestEventVeroNavData[],
  //   ui: events.filter( e => e.type === 'uiAdjustment' ) as WebLog.TestEventVeroUI[],
  // };
}

// function angle0_360( angle: number ): number {
//   while (angle < 0) {
//     angle += 360;
//   }
//   while (angle >= 360) {
//     angle -= 360;
//   }
//   return angle;
// }
