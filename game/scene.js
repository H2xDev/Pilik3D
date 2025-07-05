import { Scene } from '../core/scene.js';
import { Camera3D } from '../core/camera3d.js';
import { Player } from '../game/player.js';
import { Vec3 } from '../core/vec3.js';
import { DirectionalLight } from '../core/directionalLight.js';
import { Color } from '../core/color.js';
import { Fog } from '../core/fog.js';

import { Terrain } from './terrain.js';
import { Package } from './package.js';
import { CloudsGeometry } from './clouds.js';


export const GameScene = new class extends Scene {
  camera = this.addChild(new Camera3D());
  terrain = this.addChild(new Terrain());
  player = this.addChild(new Player());
  package = this.addChild(new Package());
  clouds= this.addChild(new CloudsGeometry());
  skyColor = new Color("#2d6170").mix(Color.WHITE, 0.5).hueRotate(60);

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
}
