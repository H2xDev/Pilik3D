import { Scene, Camera3D, Vec3, DirectionalLight, Color, Fog } from '@core/index.js';
import { Player } from './player.js';
import { Terrain } from './terrain.js';
import { Package } from './package.js';
import { CloudsGeometry } from './clouds.js';
import { SongManager } from './songManager.js';

const DRIFT_CONSTANT = 300;
const FLY_CONSTANT = 500;
const COOLNESS_TEXT = "Coolness score";
const FRAMES_TO_CALCULATE_FPS = 60;

export const GameScene = new class extends Scene {
  camera = this.addChild(new Camera3D());
  terrain = this.addChild(new Terrain());
  player = this.addChild(new Player());
  package = this.addChild(new Package());
  clouds= this.addChild(new CloudsGeometry());
  skyColor = new Color("#2d6170").mix(Color.WHITE, 0.5).hueRotate(60);
  songManager = this.addChild(new SongManager());
  coolScore = 0;
  driftVelocity = 0;
  flyVelocity = 0;
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
    Fog.current.color.assign(ctx);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  process(deltaTime) {
    this.driftVelocity = Math.round(this.player.driftValue * DRIFT_CONSTANT * deltaTime);
    this.flyVelocity = Math.round(this.player.flyValue * FLY_CONSTANT * deltaTime);

    this.coolScore += this.driftVelocity;
    this.coolScore += this.flyVelocity;

    this.time += deltaTime;
    this.frames++;

    if (this.frames >= FRAMES_TO_CALCULATE_FPS) {
      this.fps = Math.round(1 / (this.time / this.frames));
      this.time = 0;
      this.frames = 0;
    }
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

    ctx.fillStyle = "white";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "24px 'Press Start 2P'";
    ctx.fillText(COOLNESS_TEXT, ctx.canvas.width / 2, 60);
    ctx.font = "48px 'Press Start 2P'";

    ctx.save()
    ctx.translate(ctx.canvas.width / 2, 128);
    ctx.scale(1 + this.songManager.midValue * 0.5, 1 + this.songManager.bassValue * 0.5);
    ctx.fillStyle = "pink";
    ctx.fillText(this.coolScore, 0, 4);

    ctx.fillStyle = "white";
    ctx.fillText(this.coolScore, 0, 0);
    ctx.restore();

    if (!this.player.model) return;

    const p = this.camera.toScreenSpace(
      this.player.model.globalPosition
        .add(this.player.model.globalTransform.basis.backward.mul(0.5)), true);

    ctx.save();
    ctx.font = "16px 'Press Start 2P'";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.translate(p.x + ctx.canvas.width / 2, p.y + ctx.canvas.height / 2 + 32);
    ctx.scale(1 + this.songManager.midValue * 0.5, 1 + this.songManager.bassValue * 0.5);
    ctx.rotate(this.player.turnVelocity * -0.05);
    ctx.fillStyle = "white";

    let trick = this.flyVelocity > 0
      ? "COOL FLY " + Math.round(this.flyVelocity / deltaTime) + '/s'
      : this.driftVelocity > 0
        ? "COOL DRIFT " + Math.round(this.driftVelocity / deltaTime) + '/s'
        : "";

    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "cyan";
    ctx.fillText(trick, 0, 2);
    ctx.fillStyle = "white";
    ctx.fillText(trick, 0, 0);
    ctx.restore();

    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(`FPS: ${this.fps}`, 10, 10);
  }
}
