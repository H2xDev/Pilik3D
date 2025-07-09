import { Color, GeometryNode, PointLight, Vec3 } from "@core/index.js";
import { BoxGeometry } from "@core/importers/box.js";

export class Package extends GeometryNode {
  startPos = null;
  up = Vec3.UP;
  light = null;
  outline = this.addChild(new GeometryNode().assignGeometry(new BoxGeometry(-1.05, -1.05, -1.05, Color.WHITE)));

  /**
    * @returns { import("./songManager.js").SongManager }
    */
  get songManager() {
    return this.scene.songManager;
  }

  enterTree() {
    this.assignGeometry(new BoxGeometry(1, 1, 1, Color.YELLOW));
    this.outline.emissive = true;
    this.light = this.addChild(new PointLight(Color.YELLOW, 5));
  }

  process(dt) {
    this.basis.rotate(this.basis.up, dt * 2.0);
    this.basis.rotate(this.basis.right, dt * 2.0);
    this.basis.scale = new Vec3(0.25, 0.25, 0.25);
    const bassuha = 1 + this.songManager.trebleValue * 0.5;

    this.outline.transform.scale = new Vec3(bassuha, bassuha, bassuha);

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
