import { References } from '@/core/charts';
import * as WebLog from '@server/web/log';
import { TrialMeta, TrialMetaExt } from '@server/web/meta';
import * as StatTypes from '@server/statistics/types';

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

export interface DrawingEvents {
  instruction: TimedEvent[];
  drawing: TimedEvent[];
  sphere: TimedEvent[];
  cross: TimedEvent[];
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

export function drawing( allEvents: WebLog.TestEvent[], startTime: Date ) {
  const start = startTime.valueOf();

  const instructionEvents = allEvents.filter( e => e.type === 'instruction' ) as WebLog.TestEventInstruction[];
  const sphereEvents: WebLog.TestEventDrawingSphere[] = [];
  const crossEvents: WebLog.TestEventDrawingCross[] = [];
  const drawingEvents: WebLog.TestEventDrawing[] = [];

  allEvents.forEach( e => {
    if (e.type !== 'drawing') {
      return;
    }

    const drawingEvent = e as WebLog.TestEventDrawing;
    if (drawingEvent.kind === 'sphere') {
      sphereEvents.push( e as WebLog.TestEventDrawingSphere );
    }
    else if (drawingEvent.kind === 'cross') {
      crossEvents.push( e as WebLog.TestEventDrawingCross );
    }
    else {
      drawingEvents.push( drawingEvent );
    }
  });

  return {
    instruction: instructionEvents.map( e => new TimedEvent( e.timestamp.valueOf() - start, e.content.join(' '), '' ) ),
    drawing: drawingEvents.map( e => new TimedEvent( e.timestamp.valueOf() - start, e.kind, '' ) ),
    sphere: sphereEvents.map( e => new TimedEvent(
      e.timestamp.valueOf() - start,
      e.kind,
      `d=${e.diameter.toFixed(0)} at ${e.x.toFixed(0)},${e.y.toFixed(0)}`,
    )),
    cross: crossEvents.map( e => new TimedEvent(
      e.timestamp.valueOf() - start,
      e.kind,
      `at ${e.x.toFixed(0)},${e.y.toFixed(0)}`,
    )),
  } as DrawingEvents;
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

export function toRefNums( path: string, reference: StatTypes.Reference ) {
  return makeReferences<number[]>( path, reference );
}

export function toRefSet( path: string, reference: StatTypes.Reference ) {
  return makeReferences<StatTypes.Angles>( path, reference );
}

function makeReferences<T>( path: string, reference: StatTypes.Reference ) {
  const result = {} as References<T>;
  const keys = path.split('.');

  if (reference.means) {
    result.means = keys.reduce( (obj, key) => obj[ key ], reference.means as any ) as T;
  }
  if (reference.medians) {
    result.medians = keys.reduce( (obj, key) => obj[ key ], reference.medians as any ) as T;
  }
  if (reference.upperQuantile) {
    result.upperQuantile = keys.reduce( (obj, key) => obj[ key ], reference.upperQuantile as any ) as T;
  }
  if (reference.lowerQuantile) {
    result.lowerQuantile = keys.reduce( (obj, key) => obj[ key ], reference.lowerQuantile as any ) as T;
  }

  return result;
}
