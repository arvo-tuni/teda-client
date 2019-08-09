import * as WebLog from '@server/web/log';
import * as GazeEvent from '@server/tobii/gaze-event';
import { Timestamp } from '@server/tobii/log';

export interface Fixation {
  timestamp: Timestamp;
  x: number;
  y: number;
  duration: number;
}

export function toScrolledFixations( fixations: GazeEvent.Fixation[], events: WebLog.TestEvent[] ): Fixation[]  {
  const scrolls = events.filter( event => event.type === 'scroll' ) as WebLog.TestEventScroll[];

  let scrollPosition = 0;
  let nextScroll: WebLog.TestEventScroll | null = scrolls.length > 0 ? scrolls[0] : null;
  let scrollIndex = 1;

  return fixations.map( (fix, i) => {

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
