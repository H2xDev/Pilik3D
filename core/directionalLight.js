import { Color } from "./color.js";
import { GNode3D } from "./node3d.js";
import { Vec3 } from "./vec3.js";

export class DirectionalLight extends GNode3D {
  color = new Color(1, 1, 1);
  ambient = new Color(0.2, 0.2, 0.2);

  /** @type { DirectionalLight } */
  static current = null;

  process(dt, ctx) {
    DirectionalLight.current = this;
  }

  constructor(color = Color.WHITE, direction = Vec3.DOWN) {
    super();
    this.color = color;
    this.transform.basis.lookAt(direction);
  }
}
