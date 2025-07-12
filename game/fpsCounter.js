import { GNode } from '@core/index.js';

const FRAMES_TO_CALCULATE_FPS = 60;

export class FPSCounter extends GNode {
  frames = 0;
  time = 0;
  fps = 0;

  gui(dt, ctx) {
    this.time += dt;
    this.frames++;

    if (this.frames >= FRAMES_TO_CALCULATE_FPS) {
      this.fps = Math.round(1 / (this.time / this.frames));
      this.time = 0;
      this.frames = 0;
    }

    ctx.save();
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.font = '16px "Space Mono"';
    ctx.fillStyle = 'white';
    ctx.fillText(`FPS: ${Math.round(this.fps)}`, 20, 20);
    ctx.restore();
  }
}
