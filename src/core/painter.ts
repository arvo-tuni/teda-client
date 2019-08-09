import { Fixation } from '@/core/transform';
import * as WebLog from '@server/web/log.js';

const AREA_EXTENSION = 100;
const TARGET_BORDER_COLOR = '#666';
const TARGET_CLICKED_OK_COLOR = '#8cf';
const TARGET_CLICKED_WRONG_COLOR = '#fc8';
const TARGET_UNCLICKED_COLOR = '#eee';
const SACCADE_COLOR = '#888';
const FIX_BORDER_COLOR = '#666';
const FIX_FILL_SATURATION = '80'; // %
const FIX_FILL_LIGHTNESS = '80'; // %
const FIX_FILL_ALPHA = '0.5';
const FIX_FILL_DEFAULT_COLOR = `hsla(0, ${FIX_FILL_SATURATION}%, ${FIX_FILL_LIGHTNESS}%, ${FIX_FILL_ALPHA})`;

export interface FixPlotOptions {
  pixelsPerSecond: number;
  colorized: boolean;
  saccades: boolean;
  timeRange?: number[];
  saccadeColor?: string;
  fixationColor?: string;
  fixationBorderColor?: string;
  fixationSaturation?: number;
  fixationLightness?: number;
  fixationAlpha?: number;
}

export interface TargetOptions {
  borderColor?: string;
  clickedOkColor?: string;
  clickedWrongColor?: string;
  unclickedColor?: string;
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

    const w = area.width + AREA_EXTENSION;
    const h = area.height + AREA_EXTENSION;

    this.scaleX = canvas.width / w;
    this.scaleY = canvas.height / h;

    this.offsetX = area.left - AREA_EXTENSION / 2;
    this.offsetY = area.top - AREA_EXTENSION / 2;
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

  private setFixCtxParams( options: FixPlotOptions ) {
    this.ctx.strokeStyle = options.fixationBorderColor ? 
      options.fixationBorderColor : 
      FIX_BORDER_COLOR;

    this.ctx.fillStyle = options.fixationColor ? 
      options.fixationColor : 
      FIX_FILL_DEFAULT_COLOR;
  }

  private makeFixHslaTemplate( options: FixPlotOptions ): string {
    const saturation = options.fixationSaturation !== undefined ? 
      options.fixationSaturation : 
      FIX_FILL_SATURATION;

    const lightness = options.fixationLightness !== undefined ? 
      options.fixationLightness : 
      FIX_FILL_LIGHTNESS;

    const alpha = options.fixationAlpha !== undefined ? 
      options.fixationAlpha : 
      FIX_FILL_ALPHA;

    return `${saturation}%, ${lightness}%, ${alpha}`;
  }

  private drawSaccades( fixations: Fixation[], options: FixPlotOptions ) {
    this.ctx.strokeStyle = options.saccadeColor ? options.saccadeColor : SACCADE_COLOR;

    const startTime = fixations[0].timestamp.RecordingTimestamp;
    
    let hasFirstFixation = false;

    this.ctx.beginPath();

    fixations.forEach( (fix, index) => {
      const ts = fix.timestamp.RecordingTimestamp - startTime;
      if (options.timeRange && (ts < options.timeRange[0] || ts > options.timeRange[1])) {
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
    const w = area.width + AREA_EXTENSION;
    const h = area.height + AREA_EXTENSION;

    this.scaleX = this.ctx.canvas.width / w;
    this.scaleY = this.ctx.canvas.height / h;

    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height );
  }

  drawTargets( targets: Target[], options?: TargetOptions ) {
    const opt = options || {};

    this.ctx.strokeStyle = opt.borderColor ? opt.borderColor : TARGET_BORDER_COLOR;

    targets.forEach( target => {
      const rect  = this.calcRect( target.bounds );

      if (rect.width > 200) {
        console.dir(target);
      }

      if (target.isClicked) {
        this.ctx.fillStyle = target.isCorrectClick ? 
          (opt.clickedOkColor || TARGET_CLICKED_OK_COLOR) : 
          (opt.clickedWrongColor || TARGET_CLICKED_WRONG_COLOR);
        this.ctx.fillRect( rect.x, rect.y, rect.width, rect.height );
      }
      else {
        this.ctx.fillStyle = opt.unclickedColor ? opt.unclickedColor : TARGET_UNCLICKED_COLOR;
        this.ctx.fillRect( rect.x, rect.y, rect.width, rect.height );
      }

      this.ctx.strokeRect( rect.x, rect.y, rect.width, rect.height );
    });
  }

  drawFixPlot( fixations: Fixation[], options: FixPlotOptions ) {

    if (options.saccades) {
      this.drawSaccades( fixations, options );
    }

    this.setFixCtxParams( options );
    const hslaTemplate = this.makeFixHslaTemplate( options );

    const startTime = fixations[0].timestamp.RecordingTimestamp;                        // first fixation
    const duration = fixations.slice( -1 )[0].timestamp.RecordingTimestamp - startTime; // last fixation

    fixations.forEach( fix => {
      const ts = fix.timestamp.RecordingTimestamp - startTime;
      if (options.timeRange && (ts < options.timeRange[0] || ts > options.timeRange[1])) {
        return;
      }

      const point = this.calcPoint({ x: fix.x, y: fix.y });
      const radius = Math.max( 2, fix.duration * options.pixelsPerSecond / 1000 );

      if (options.colorized) {
        const hue = Math.round( ts / duration * 300 ); // 300 is max hue (violet)
        this.ctx.fillStyle = `hsla(${hue}, ${hslaTemplate})`;
      }

      this.ctx.beginPath();
      this.ctx.ellipse( point.x, point.y, radius, radius, 0, 0, 2 * Math.PI );
      this.ctx.fill();
      this.ctx.stroke();
    });
  }
}