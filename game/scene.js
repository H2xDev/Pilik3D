import { Scene, Camera3D, Vec3, DirectionalLight, Color, Fog } from '@core/index.js';
import { Player } from './player.js';
import { Terrain } from './terrain.js';
import { CloudsGeometry } from './clouds.js';
import { SongManager } from './songManager.js';
import { GameManager } from './gameManager.js';
import { FPSCounter } from './fpsCounter.js';
import { Tower } from './tower.js';

export class GameScene extends Scene {
  camera = this.addChild(new Camera3D());
  terrain = this.addChild(new Terrain());
  player = this.addChild(new Player());
  clouds= this.addChild(new CloudsGeometry());
  skyColor = new Color("#2d6170").mix(Color.WHITE, 0.5).hueRotate(60);
  songManager = this.addChild(new SongManager());
  gameManager = this.addChild(new GameManager());
  fpsCounter = this.addChild(new FPSCounter());
  skyGradient = null;
  tower = this.addChild(new Tower());

  time = 0;
  frames = 0;
  fps = 0;

  async begin() {
    this.addChild(new DirectionalLight(
      this.skyColor,
      Vec3.DOWN
    ));

    Fog.current.color = this.skyColor;
  }

  /**
    * @param { number } deltaTime - Delta time in seconds.
    * @param { CanvasRenderingContext2D } ctx - The rendering context.
    */
  bg(deltaTime, ctx) {
    if (!this.skyGradient) {
      this.skyGradient = ctx.createLinearGradient(ctx.canvas.width / 2, -ctx.canvas.height / 2, ctx.canvas.width / 2, ctx.canvas.height / 2);
      this.skyGradient.addColorStop(0.0, this.skyColor.mul(0.5).toString());
      this.skyGradient.addColorStop(0.5, this.skyColor.toString());
    }

    ctx.fillStyle = this.skyGradient;
    ctx.save()
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2)
    ctx.scale(1.5, 1.5);
    ctx.rotate(this.camera.basis.roll);
    ctx.fillRect(-ctx.canvas.width / 2, -ctx.canvas.height / 2, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }

  gui(deltaTime, ctx) {
    ctx.save();
    ctx.filter = "blur(8px)";
    ctx.globalAlpha = this.songManager.trebleValue * 0.8;
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(
      ctx.canvas,
      0, 0,
      ctx.canvas.width, ctx.canvas.height
    );
    ctx.restore();
  }
}
