import { GeometryNode } from "../core/geometryNode.js";
import { PlaneGeometry } from "../core/importers/plane.js";
import { Vec3 } from "../core/vec3.js";
import { Perlin } from "../core/perlin.js";
import { getNormal } from "../core/utils.js";

const perlin = new Perlin();
const GRID_SIZE = 5;
const CHUNK_SIZE = 20;

export class Terrain extends GeometryNode {

  /** @type { import("./player.js").Player } */
  get player() {
    return this.scene?.player;
  }

  /** @type { Vec3 | string } */
  positionHash_ = null;

  get positionHash() {
    return this.positionHash_;
  }

  set positionHash(value) {
    const oldHash = this.positionHash_;
    this.positionHash_ = [value.x, value.z].join(",");

    if (oldHash !== this.positionHash_) {
      this.trigger('positionHashChanged', this.positionHash_);
    }
  }

  enterTree() {
    this.assignGeometry(new PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE));
    this.on('positionHashChanged', this.regenerateTerrain.bind(this));
    this.regenerateTerrain();
  }

  process(dt) {
    const gridPos = this.player.position.div(GRID_SIZE).round();
    this.positionHash = gridPos;
  }

  getHeightAt(x, z) {
    x = Math.floor(x / 0.1) * 0.1; // Snap to grid
    z = Math.floor(z / 0.1) * 0.1; // Snap to grid
    // Generate height using Perlin noise
    return perlin.get(x / GRID_SIZE, z / GRID_SIZE) * 2.0;
  }

  getPositionAt(x, z) {
    const h = this.getHeightAt(x, z);
    return new Vec3(x, h, z);
  }

  getNormalAt(x, z) {
    const h1 = this.getHeightAt(x, z);
    const h2 = this.getHeightAt(x + 1, z);
    const h3 = this.getHeightAt(x, z + 1);

    const p1 = new Vec3(x, h1, z);
    const p2 = new Vec3(x + 1, h2, z);
    const p3 = new Vec3(x, h3, z + 1);

    return getNormal(p1, p2, p3).mul(-1).normalized;
  }

  regenerateTerrain() {
    if (!this.player) return;

    const gridPos = this.player.position.div(GRID_SIZE).round();
    const vertices = this.vertices;
    const normals = this.normals;

    for (let i = 0; i < vertices.length; i++) {
      const v = vertices[i]
      const ix = i % (CHUNK_SIZE + 1);
      const iz = (i / (CHUNK_SIZE + 1)) >> 0;

      // Generate height using Perlin noise
      v.x = gridPos.x * GRID_SIZE + ix - CHUNK_SIZE * 0.5;
      v.z = gridPos.z * GRID_SIZE + iz - CHUNK_SIZE * 0.5;
      v.y = this.getHeightAt(v.x, v.z);

      const h1 = this.getHeightAt(v.x, v.z);
      const h2 = this.getHeightAt(v.x + 1, v.z);
      const h3 = this.getHeightAt(v.x, v.z + 1);

      const p1 = new Vec3(v.x, h1, v.z);
      const p2 = new Vec3(v.x + 1, h2, v.z);
      const p3 = new Vec3(v.x, h3, v.z + 1);

      const normal = getNormal(p1, p2, p3).mul(-1).normalized;

      if (normal.y < 0) {
        // Flip the normal if it's pointing downwards
        normal.y *= -1;
      }

      normals[i] = normal;
    }

    this.updateGeometry();
  }
}
