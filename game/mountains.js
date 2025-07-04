import { Color } from "../core/color.js";
import { GeometryNode } from "../core/geometryNode.js";
import { PlaneGeometry } from "../core/importers/plane.js";
import { Perlin } from "../core/perlin.js";
import { Vec3 } from "../core/vec3.js";

const perlin = new Perlin();

export class MountainsGeometry extends GeometryNode {
  passDepth = true;

  constructor() {
    super();
    this.assignGeometry(new PlaneGeometry(10, 10, true));

    this.vertices = this.vertices.map(v => {
      const dist = v.length * 3.0;
      const height = perlin.get(v.x / 2, v.z / 2) * dist; // Adjust the scale as needed

      return new Vec3(v.x, height - 0.3, v.z);
    });

    this.basis.scale = this.basis.scale.add(Vec3.XZ.mul(2)); // Scale down the mountains

    this.updateGeometry();
  }

  process(dt) {
    this.position = this.scene.camera.globalPosition;
  }
}
