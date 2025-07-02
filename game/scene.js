import { Scene } from '../core/scene.js';
import { Camera3D } from '../core/camera3d.js';
import { Player } from '../game/player.js';
import { PointLight } from '../core/light.js';
import { Vec3 } from '../core/vec3.js';
import { DirectionalLight } from '../core/directionalLight.js';
import { Color } from '../core/color.js';

import { Terrain } from './terrain.js';

const EACH_FRAME = 30;

export const GameScene = new class extends Scene {
  camera = new Camera3D();
  terrain = new Terrain();
  player = new Player();
  light = new PointLight();
  light2 = new PointLight(Color.GREEN);
  fpsSumCounter = 0;
  fps = 0;
  frame = 0;

  async begin() {
    this.addChild(this.camera);
    this.addChild(this.terrain);
    this.addChild(this.player);
    this.addChild(this.light);
    this.addChild(this.light2);
    this.addChild(new DirectionalLight(
      new Color("#235248"),
      Vec3.DOWN
    ));
  }

  process(deltaTime) {
    this.light.position = Vec3.UP.mul(0.5)
    this.light.position.x = Math.sin(Date.now() / 1000) * 1.0;
    this.light.position.z = Math.cos(Date.now() / 1000) * 1.0;
    
    this.light2.position = Vec3.UP.mul(0.5)
    this.light2.position.x = Math.cos(Date.now() / 300) * 1.0;
    this.light2.position.z = Math.sin(Date.now() / 300) * 1.0;
  }

  /**
    * @param { number } deltaTime - Delta time in seconds.
    * @param { CanvasRenderingContext2D } ctx - The rendering context.
    */
  bg(deltaTime, ctx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
