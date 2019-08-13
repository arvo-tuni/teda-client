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

export function toScrolledFixations( fixations: GazeEvent.Fixation[], events: WebLog.TestEvent[] ): Fixation[]  {
  const scrolls = events.filter( event => event.type === 'scroll' ) as WebLog.TestEventScroll[];

  let scrollPosition = 0;
  let nextScroll: WebLog.TestEventScroll | null = scrolls.length > 0 ? scrolls[0] : null;
  let scrollIndex = 1;

  return fixations.map( fix => {

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

export function getSaccades( fixations: GazeEvent.Fixation[] ): Saccade[]  {
  // let prevFix: GazeEvent.Fixation | null = null;
  // let prevAngle = 0;

  return fixations.map( fix => {
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

export function averageDuration( fixations: Fixation[] ): number {
  if (fixations.length === 0) {
    return 0;
  }
  else {
    return fixations.reduce( (acc, fix) => acc += fix.duration, 0 ) / fixations.length;
  }
}

export function averageAmplitude( saccades: Saccade[] ): number {
  if (saccades.length === 0) {
    return 0;
  }
  else {
    return saccades.reduce( (acc, sacc) => acc += sacc.amplitude, 0 ) / saccades.length;
  }
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
