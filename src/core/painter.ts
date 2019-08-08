import { Fixation } from '@/core/transform';
import * as WebLog from '../../../test-data-server/js/web/log.js';

const FIX_BORDER_COLOR = '#666';
const SACCADE_COLOR = '#888';
const FIX_FILL_DEFAULT_COLOR = 'hsla(0, 80%, 80%, 0.5)';

export interface FixPlotOptions {
  pixelsPerSecond: number;
  colorized: boolean;
  saccades: boolean;
  timeRange: number[];
}

export class Target {
  bounds: WebLog.Bounds;
  isClicked: boolean;
  isCorrectClick: boolean;

  constructor( bounds: WebLog.Bounds, isClicked: boolean, isCorrectClick: boolean ) {
    this.bounds = bounds;
    this.isClicked = isClicked;
    this.isCorrectClick = isCorrectClick;
  }
}

export class Painter {
  private ctx: CanvasRenderingContext2D;
  private scaleX: number;
  private scaleY: number;
  private offsetX: number;
  private offsetY: number;

  constructor( canvas: HTMLCanvasElement, area: WebLog.ContentArea ) {
    this.ctx = canvas.getContext( '2d' ) as CanvasRenderingContext2D;
    this.scaleX = canvas.width / area.width;
    this.scaleY = canvas.height / area.height;
    this.offsetX = area.left;
    this.offsetY = area.top;
  }

  private calcPoint( point: {x: number, y: number} ) {
    return {
      x: (point.x - this.offsetX) * this.scaleX,
      y: (point.y - this.offsetY) * this.scaleY,
    };
  }

  private calcRect( bounds: WebLog.Bounds ) {
    return {
      x: (bounds.left - this.offsetX) * this.scaleX,
      y: (bounds.top - this.offsetY) * this.scaleY,
      width: bounds.width * this.scaleX,
      height: bounds.height * this.scaleY,
    };
  }

  private drawSaccades( fixations: Fixation[], options: FixPlotOptions ) {
    this.ctx.strokeStyle = SACCADE_COLOR;
    this.ctx.beginPath();

    const startTime = fixations[0].timestamp.RecordingTimestamp;
    
    let hasFirstFixation = false;

    fixations.forEach( (fix, index) => {
      const ts = fix.timestamp.RecordingTimestamp - startTime;
      if (ts < options.timeRange[0] || ts > options.timeRange[1]) {
        return;
      }

      if (!hasFirstFixation) {
        const startPoint = this.calcPoint({ x: fix.x, y: fix.y });
        this.ctx.moveTo( startPoint.x, startPoint.y );
        hasFirstFixation = true;
        return;
      }

      const point = this.calcPoint({ x: fix.x, y: fix.y });
      this.ctx.lineTo( point.x, point.y );
    });

    this.ctx.stroke();
  }

  reset( area: WebLog.ContentArea ) {
    this.scaleX = this.ctx.canvas.width / area.width;
    this.scaleY = this.ctx.canvas.height / area.height;

    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height );
  }

  drawTargets( targets: Target[] ) {
    this.ctx.strokeStyle = '#666';

    targets.forEach( target => {
      const rect  = this.calcRect( target.bounds );

      if (rect.width > 200) {
        console.dir(target);
      }

      if (target.isClicked) {
        this.ctx.fillStyle = target.isCorrectClick ? '#8cf' : '#fc8';
        this.ctx.fillRect( rect.x, rect.y, rect.width, rect.height );
      }

      this.ctx.strokeRect( rect.x, rect.y, rect.width, rect.height );
    });
  }

  drawFixPlot( fixations: Fixation[], options: FixPlotOptions ) {

    if (options.saccades) {
      this.drawSaccades( fixations, options );
    }

    this.ctx.strokeStyle = FIX_BORDER_COLOR;
    this.ctx.fillStyle = FIX_FILL_DEFAULT_COLOR;

    const startTime = fixations[0].timestamp.RecordingTimestamp;                        // first fixation
    const duration = fixations.slice( -1 )[0].timestamp.RecordingTimestamp - startTime; // last fixation

    fixations.forEach( fix => {
      const ts = fix.timestamp.RecordingTimestamp - startTime;
      if (ts < options.timeRange[0] || ts > options.timeRange[1]) {
        return;
      }

      const point = this.calcPoint({ x: fix.x, y: fix.y });
      const radius = Math.max( 2, fix.duration * options.pixelsPerSecond / 1000 );

      if (options.colorized) {
        const hue = Math.round( ts / duration * 300 ); // 300 is max hue (violet)
        this.ctx.fillStyle = `hsla(${hue}, 80%, 80%, 0.65)`;
      }

      this.ctx.beginPath();
      this.ctx.ellipse( point.x, point.y, radius, radius, 0, 0, 2 * Math.PI );
      this.ctx.fill();
      this.ctx.stroke();
    });
  }
}