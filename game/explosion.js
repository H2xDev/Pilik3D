import { GeometryNode, Color, Vec3 } from '@core/index.js';
import { BoxGeometry } from '@core/importers/box.js';

export class Explosion extends GeometryNode {
  animationTime = 1;
  elapsedTime = 0;
  noBackfaceCulling = true;


  constructor(position = Vec3.ZERO) {
    super(new BoxGeometry(1.0, 1.0, 1.0));
    this.emissive = true;
    this.globalPosition = position;
    this.basis.rotate(Vec3.RIGHT, Math.PI / 4);
    this.basis.rotate(Vec3.FORWARD, Math.PI / 4);
    this.basis.rotate(Vec3.UP, Math.random() * Math.PI * 2);
  }

  process(dt) {
    this.animationTime -= dt * 0.5;
    const percent = this.easeOutExponential(1.0 - this.animationTime / 1.0);
    this.scale = Vec3.ONE.mul(0.2 + percent * 1.0);
    this.opacity = 1.0 - percent;

    if (this.animationTime <= 0) {
      this.parent.removeChild(this);
      return;
    }
  }

  polygonProgram(polygon) {
    polygon.color = Color.YELLOW;

    return polygon;
  }
  
  easeOutQuad(t) {
    return t * (2 - t);
  }

  easeOutExponential(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);  
  }
}
