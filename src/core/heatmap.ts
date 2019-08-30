import { Fixation } from '@server/statistics/types';

import * as WebLog from '@server/web/log';

declare function createWebGLHeatmap( options: any ): any;

const AREA_EXTENSION = 100;

export interface HeatmapOptions {
  pixelsPerSecond: number;
  intensity: number;
  timeRange?: number[];
}

export class Heatmap {
  private canvas: HTMLCanvasElement;
  private heatmap: any;
  private scaleX: number;
  private scaleY: number;
  private offsetX: number;
  private offsetY: number;

  constructor( canvas: HTMLCanvasElement, area: WebLog.ContentArea ) {
    this.canvas = canvas;

    this.heatmap = createWebGLHeatmap({ canvas: this.canvas });

    const w = area.width + AREA_EXTENSION;
    const h = area.height + AREA_EXTENSION;

    this.scaleX = canvas.width / w;
    this.scaleY = canvas.height / h;

    this.offsetX = area.left - AREA_EXTENSION / 2;
    this.offsetY = area.top - AREA_EXTENSION / 2;
  }

  reset( area: WebLog.ContentArea ) {
    const w = area.width + AREA_EXTENSION;
    const h = area.height + AREA_EXTENSION;

    this.scaleX = this.canvas.width / w;
    this.scaleY = this.canvas.height / h;

    this.heatmap.clear();
  }

  draw( fixations: Fixation[], options: HeatmapOptions ) {
    const startTime = fixations[0].timestamp.RecordingTimestamp;                        // first fixation
    const duration = fixations.slice( -1 )[0].timestamp.RecordingTimestamp - startTime; // last fixation

    this.heatmap.adjustSize();

    fixations.forEach( fix => {
      const ts = fix.timestamp.RecordingTimestamp - startTime;
      if (options.timeRange && (ts < options.timeRange[0] || ts > options.timeRange[1])) {
        return;
      }

      const point = this.calcPoint({ x: fix.x, y: fix.y });
      const radius = Math.max( 2, fix.duration * options.pixelsPerSecond / 1000 );

      this.heatmap.addPoint(
        point.x,
        point.y,
        radius,
        options.intensity / 1000,
      );
    });

    this.heatmap.update();
    this.heatmap.display();
  }

  private calcPoint( point: {x: number, y: number} ) {
    return {
      x: (point.x - this.offsetX) * this.scaleX,
      y: (point.y - this.offsetY) * this.scaleY,
    };
  }
}
