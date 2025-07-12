import { GeometryNode } from '@core/index.js';
import { BoxGeometry } from '@core/importers/box.js';
import { Explosion } from './explosion.js';

export class TowerBullet extends GeometryNode {
  speed = 10;

  constructor() {
    super(new BoxGeometry(0.1, 0.1, 0.1));
  }

  process(dt) {
    if (!this.scene.terrain) return;
    this.position = this.position.add(this.basis.forward.mul(dt * this.speed));

    const height = this.scene.terrain.getHeightAt(this.globalPosition.x, this.globalPosition.z);
    if (this.globalPosition.y < height) {
      this.parent.removeChild(this);
      this.scene.addChild(new Explosion(this.globalPosition));
      return;
    }
  }
}
