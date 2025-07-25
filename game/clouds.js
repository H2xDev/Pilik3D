import { Color, GeometryNode, Vec3 } from "@core/index.js";
import { OBJImporter } from "../core/importers/obj.js";

export class CloudsGeometry extends GeometryNode {
  passDepth = true;

  /**
    * @type { import("./songManager.js").SongManager }
    */
  get songManager() {
    return this.scene.songManager;
  }

  constructor() {
    super();
    fetch('/assets/clouds.obj')
      .then(res => res.text())
      .then(data => {
        this.assignGeometry(new OBJImporter(data));
      });
    this.emissive = true;
  }

  process(dt) {
    this.position = this.scene.camera.globalPosition.add(Vec3.DOWN.mul(1));
    this.basis.rotate(Vec3.UP, dt * 0.1);
  }

  /**
    * @param { import("../core/polygon").Polygon } polygon - The polygon to preprocess.
    * @param { import("../core/camera3d").Camera3D } camera3d - The camera used for rendering.
    */
  polygonProgram(polygon, camera3d) {
    const p = polygon.clone();
    p.v1.y += Math.sin(Date.now() / 1000 + p.v1.length) * 0.5;
    p.v2.y += Math.sin(Date.now() / 1000 + p.v2.length) * 0.5;
    p.v3.y += Math.sin(Date.now() / 1000 + p.v3.length) * 0.5;
    p.v1 = p.v1.add(p.normal.mul(this.songManager.trebleValue * 0.5));
    p.v2 = p.v2.add(p.normal.mul(this.songManager.trebleValue * 0.5));
    p.v3 = p.v3.add(p.normal.mul(this.songManager.trebleValue * 0.5));
    p.color = Color.CYAN.hueRotate(p.center.length * 10);
    p.recalculateNormal();

    return p;
  }
}
