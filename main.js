import { PlaneGeometry } from './core/importers/plane.js';
import { GeometryNode } from './core/geometryNode.js';
import { GameLoop } from './core/gameLoop.js';
import { Scene } from './core/scene.js';
import { Camera3D } from './core/camera3d.js';
import { Player } from './game/player.js';
import { PointLight } from './core/light.js';
import { Vec3 } from './core/vec3.js';
import { DirectionalLight } from './core/directionalLight.js';
import { Color } from './core/color.js';

const game = new GameLoop();
const scene = new class extends Scene {
  camera = new Camera3D();
  async begin() {
    this.addChild(this.camera);
    this.addChild(new Player());
    this.addChild(new GeometryNode().assignGeometry(new PlaneGeometry(10, 10)));

    this.addChild(new DirectionalLight(
      new Color("#235248"),
      Vec3.DOWN
    ));

    const light = this.addChild(new PointLight());
    light.transform.position = light.transform.position.add(Vec3.UP);
  }

  bg(deltaTime, ctx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  gui(deltaTime, ctx) {
    const FPS = 1 / deltaTime;
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`FPS: ${FPS.toFixed(2)}`, 10, 32);
  }
}
game
  .setup({
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
    }
  })
  .mountTo(document.body)
  .changeScene(scene)
  .begin();
