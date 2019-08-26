import * as WebLog from '@server/web/log';
import * as GazeEvent from '@server/tobii/gaze-event';
import { TrialMeta, TrialMetaExt } from '@server/web/meta';
import * as StatTransform from '../../../test-data-server/src/statistics/transform';

// Interfaces

export class TimedEvent {
  timestamp: number;
  name: string;
  value: string | number;

  constructor( timestamp: number, name: string, value: string | number ) {
    this.timestamp = timestamp;
    this.name = name;
    this.value = value;
  }
}

export interface VeroEvents {
  nav: TimedEvent[];
  data: TimedEvent[];
  ui: TimedEvent[];
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

// Filter events

export function vero( allEvents: WebLog.TestEvent[], startTime: Date ) {
  const start = startTime.valueOf();

  const navEvents = allEvents.filter( e => e.type === 'veroNavigation' ) as WebLog.TestEventVeroNav[];
  const dataEvents = allEvents.filter( e => e.type === 'veroNavigationData' ) as WebLog.TestEventVeroNavData[];
  const uiEvents = allEvents.filter( e => e.type === 'uiAdjustment' ) as WebLog.TestEventVeroUI[];

  return {
    nav: navEvents.map( e => new TimedEvent( e.timestamp.valueOf() - start, e.target, '' ) ),
    data: dataEvents.map( e => new TimedEvent( e.timestamp.valueOf() - start, e.variable, e.value ) ),
    ui: uiEvents.map( e => new TimedEvent( e.timestamp.valueOf() - start, e.target, e.enable ) ),
  } as VeroEvents;
}

export function clicks( allEvents: WebLog.TestEvent[], startTime: Date ): TimedEvent[] {
  const start = startTime.valueOf();

  const clickEvents = allEvents.filter( e => e.type === 'clicked' ) as WebLog.TestEventClicked[];

  return clickEvents.map( e => new TimedEvent( e.timestamp.valueOf() - start, 'click', e.index ) );
}

export function scrolls( allEvents: WebLog.TestEvent[], startTime: Date ): TimedEvent[] {
  const start = startTime.valueOf();

  const scrollEvents = allEvents.filter( e => e.type === 'scroll' ) as WebLog.TestEventScroll[];

  return scrollEvents.map( e => new TimedEvent( e.timestamp.valueOf() - start, 'scroll', e.position ) );
}

// Transform data

export function fixations( data: GazeEvent.Fixation[], allEvents: WebLog.TestEvent[] )  {
  return StatTransform.fixations( data, allEvents);
}

export function saccades( data: GazeEvent.Fixation[] )  {
  return StatTransform.saccades( data );
}
