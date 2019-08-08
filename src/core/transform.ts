import * as WebLog from '../../../test-data-server/js/web/log.js';
import * as GazeEvent from '../../../test-data-server/js/tobii/gaze-event';
import { Timestamp } from '../../../test-data-server/js/tobii/log.js';

export interface Fixation {
  timestamp: Timestamp;
  x: number;
  y: number;
  duration: number;
}

export function toScrolledFixations( fixations: GazeEvent.Fixation[], events: WebLog.TestEvent[] ): Fixation[]  {
  const scrolls: WebLog.TestEventScroll[] = events.filter( event => event.type === 'scroll' ) as WebLog.TestEventScroll[];

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