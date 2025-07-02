import { GeometryNode } from "../core/geometryNode.js";
import { PlaneGeometry } from "../core/importers/plane.js";
import { Vec3 } from "../core/vec3.js";
import { Perlin } from "../core/perlin.js";

const perlin = new Perlin();
const GRID_SIZE = 5;
const CHUNK_SIZE = 15;

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

    // this.position = gridPos.mul(10);
  }

  getHeightAt(x, z) {
    x = Math.floor(x / 0.1) * 0.1; // Snap to grid
    z = Math.floor(z / 0.1) * 0.1; // Snap to grid
    // Generate height using Perlin noise
    return perlin.get(x / GRID_SIZE, z / GRID_SIZE);
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
      v.y = perlin.get(v.x / GRID_SIZE, v.z / GRID_SIZE);

      const h1 = this.getHeightAt(v.x, v.z);
      const h2 = this.getHeightAt(v.x + 0.1, v.z);
      const h3 = this.getHeightAt(v.x, v.z + 0.1);

      const normal = new Vec3(
        h1 - h2,
        0.1, // Small offset to avoid zero vector
        h1 - h3
      ).normalized;

      normals[i] = normal;
    }

    this.updateGeometry();
  }
}
