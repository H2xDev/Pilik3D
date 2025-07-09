import { Scene, Camera3D, Vec3, DirectionalLight, Color, Fog } from '@core/index.js';
import { Player } from './player.js';
import { Terrain } from './terrain.js';
import { Package } from './package.js';
import { CloudsGeometry } from './clouds.js';
import { SongManager } from './songManager.js';


export const GameScene = new class extends Scene {
  camera = this.addChild(new Camera3D());
  terrain = this.addChild(new Terrain());
  player = this.addChild(new Player());
  package = this.addChild(new Package());
  clouds= this.addChild(new CloudsGeometry());
  skyColor = new Color("#2d6170").mix(Color.WHITE, 0.5).hueRotate(60);
  songManager = this.addChild(new SongManager());


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
