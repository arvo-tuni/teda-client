import * as WebLog from '@server/web/log';
import { TrialMeta, TrialMetaExt } from '../../../test-data-server/src/web/meta';
import * as GazeEvent from '@server/tobii/gaze-event';
import { Timestamp } from '@server/tobii/log';

// Interfaces

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

export class TimedMouseEvent {
  timestamp: number;
  name: string;
  value: number;

  constructor( timestamp: number, name: string, value: number ) {
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

// Make timestamps as Date

export function trials( data: TrialMeta[] ): TrialMeta[] {
  data.forEach( item => {
    if (typeof item.timestamp === 'string') {
      item.timestamp = new Date( item.timestamp );
    }
  });

  return data;
}

export function meta( data: TrialMetaExt ): TrialMetaExt {
  if (typeof data.startTime === 'string') {
    data.startTime = new Date( data.startTime );
  }
  if (typeof data.endTime === 'string') {
    data.endTime = new Date( data.endTime );
  }

  return data;
}

export function events( allEvents: WebLog.TestEvent[] ): WebLog.TestEvent[] {
  allEvents.forEach( e => {
    if (typeof e.timestamp === 'string') {
      e.timestamp = new Date( e.timestamp );
    }
  });

  return allEvents;
}

// Transform data

export function fixations( data: GazeEvent.Fixation[], allEvents: WebLog.TestEvent[] ): Fixation[]  {

  const scrollEvents = allEvents.filter( e => e.type === 'scroll' ) as WebLog.TestEventScroll[];

  let scrollPosition = 0;
  let nextScroll: WebLog.TestEventScroll | null = scrollEvents.length > 0 ? scrollEvents[0] : null;
  let scrollIndex = 1;

  return data.map( fixation => {

    while (nextScroll && nextScroll.timestamp < fixation.timestamp.LocalTimeStamp) {
      scrollPosition = nextScroll.position;
      nextScroll = scrollIndex < scrollEvents.length ? scrollEvents[ scrollIndex++ ] : null;
    }

    if (typeof fixation.timestamp.LocalTimeStamp === 'string') {
      fixation.timestamp.LocalTimeStamp = new Date( fixation.timestamp.LocalTimeStamp );
    }

    return {
      timestamp: fixation.timestamp,
      x: fixation.x,
      y: fixation.y + scrollPosition,
      duration: fixation.duration,
    };
  });
}

export function saccades( data: GazeEvent.Fixation[] ): Saccade[]  {
  return data.map( fixation => {
    if (typeof fixation.timestamp.LocalTimeStamp === 'string') {
      fixation.timestamp.LocalTimeStamp = new Date( fixation.timestamp.LocalTimeStamp );
    }

    return {
      timestamp: fixation.timestamp,
      amplitude: fixation.saccadicAmplitude,
      absoluteAngle: fixation.absoluteSaccadicDirection,
      relativeAngle: fixation.relativeSaccadicDirection,
    };
  });
}

// Filter events

export function vero( allEvents: WebLog.TestEvent[], startTime: Date ): VeroEvents {
  const start = startTime.valueOf();

  const navEvents = allEvents.filter( e => e.type === 'veroNavigation' ) as WebLog.TestEventVeroNav[];
  const dataEvents = allEvents.filter( e => e.type === 'veroNavigationData' ) as WebLog.TestEventVeroNavData[];
  const uiEvents = allEvents.filter( e => e.type === 'uiAdjustment' ) as WebLog.TestEventVeroUI[];

  return {
    nav: navEvents.map( e => new TimedVeroEvent( e.timestamp.valueOf() - start, e.target, '' ) ),
    data: dataEvents.map( e => new TimedVeroEvent( e.timestamp.valueOf() - start, e.variable, e.value ) ),
    ui: uiEvents.map( e => new TimedVeroEvent( e.timestamp.valueOf() - start, e.target, e.enable ) ),
  };
}

export function clicks( allEvents: WebLog.TestEvent[], startTime: Date ): TimedMouseEvent[] {
  const start = startTime.valueOf();

  const clickEvents = allEvents.filter( e => e.type === 'clicked' ) as WebLog.TestEventClicked[];

  return clickEvents.map( e => new TimedMouseEvent( e.timestamp.valueOf() - start, 'click', e.index ) );
}

export function scrolls( allEvents: WebLog.TestEvent[], startTime: Date ): TimedMouseEvent[] {
  const start = startTime.valueOf();

  const scrollEvents = allEvents.filter( e => e.type === 'scroll' ) as WebLog.TestEventScroll[];

  return scrollEvents.map( e => new TimedMouseEvent( e.timestamp.valueOf() - start, 'scroll', e.position ) );
}

// Misc

export function averageDuration( data: Fixation[] ): number {
  if (data.length === 0) {
    return 0;
  }
  else {
    return data.reduce( (acc, fixation) => acc += fixation.duration, 0 ) / data.length;
  }
}

export function averageAmplitude( data: Saccade[] ): number {
  if (data.length === 0) {
    return 0;
  }
  else {
    return data.reduce( (acc, saccade) => acc += saccade.amplitude, 0 ) / data.length;
  }
}
