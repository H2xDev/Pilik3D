import { Color } from "../core/color.js";
import { GeometryNode } from "../core/geometryNode.js";
import { BoxGeometry } from "../core/importers/box.js";
import { PointLight } from "../core/light.js";
import { Vec3 } from "../core/vec3.js";

export class Package extends GeometryNode {
  startPos = null;
  up = Vec3.UP;
  light = null;

  enterTree() {
    this.assignGeometry(new BoxGeometry(1, 1, 1, Color.YELLOW));
    const outline = this.addChild(new GeometryNode().assignGeometry(new BoxGeometry(-1.05, -1.05, -1.05, Color.WHITE)))
    outline.emissive = true;
    this.light = this.addChild(new PointLight(Color.YELLOW, 5));
  }

  process(dt) {
    this.basis.rotate(this.basis.up, dt * 2.0);
    this.basis.rotate(this.basis.right, dt * 2.0);
    this.basis.scale = new Vec3(0.25, 0.25, 0.25);

    if (!this.startPos) {
      this.up = this.scene.terrain.getNormalAt(this.position.x, this.position.z);
      this.startPos = this.scene.terrain
        .getPositionAt(this.position.x, this.position.z)
        .add(this.up.mul(0.5));
    }
    this.light.globalPosition = this.startPos.add(Vec3.UP.mul(2.0));

    this.position = this.startPos.add(Vec3.UP.mul(Math.sin(Date.now() / 1000) * 0.1))
  }
}
