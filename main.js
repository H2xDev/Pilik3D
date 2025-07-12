import { GameLoop } from './core/gameLoop.js';
import { GameScene } from './game/scene.js';

const RESOLUTION_SCALE = 0.7;

window.addEventListener('load', () => {
  const game = new GameLoop();
  game
    .setup({
      width: window.innerWidth * RESOLUTION_SCALE,
      height: window.innerHeight * RESOLUTION_SCALE,
      style: {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
      }
    })
    .mountTo(document.body)
    .changeScene(new GameScene)
    .begin();
  
  // Prevent iOS from scrolling the page when touching the canvas
  window.scrollTo(0,1)
  
  window.addEventListener('touchstart', (e) => {
    document.body.requestFullscreen({ navigationUI: 'hide' })
  });
  
  window.addEventListener('resize', () => {
    game.canvas.width = window.innerWidth * RESOLUTION_SCALE;
    game.canvas.height = window.innerHeight * RESOLUTION_SCALE;
  });
});
