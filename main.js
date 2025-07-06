import { GameLoop } from './core/gameLoop.js';
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
