import * as WebLog from '../../../test-data-server/js/web/log.js';

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

  drawTargets( targets: Target[] ) {
    this.ctx.strokeStyle = '#666';

    targets.forEach( target => {

      const x = (target.bounds.left - this.offsetX) * this.scaleX;
      const y = (target.bounds.top - this.offsetY) * this.scaleY;
      const w = target.bounds.width * this.scaleX;
      const h = target.bounds.height * this.scaleY;

      if (w > 200) {
        console.dir(target);
      }

      if (target.isClicked) {
        this.ctx.fillStyle = target.isCorrectClick ? '#8cf' : '#fc8';
        this.ctx.fillRect( x, y, w, h );
      }

      this.ctx.strokeRect( x, y, w, h );
    });
  }
}