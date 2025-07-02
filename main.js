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

import { GameScene } from './game/scene.js';

const game = new GameLoop();
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
  .changeScene(GameScene)
  .begin();
