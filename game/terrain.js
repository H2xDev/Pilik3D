import { GeometryNode, Vec3, Perlin, getNormal, Color } from "@core/index.js";
import { PlaneGeometry } from "../core/importers/plane.js";

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
  }

  /**
    * @param { number } x - The x coordinate.
    * @param { number } z - The z coordinate.
    */
  getHeightAt(x, z) {
    const precision = 0.01; // Adjust precision for Perlin noise
    x = Math.floor(x / precision) * precision;
    z = Math.floor(z / precision) * precision;

    let multiplier = 2.0;

    // Generate height using Perlin noise
    const d = perlin.get(x / GRID_SIZE / 1, z / GRID_SIZE / 1) * multiplier;

    return Math.pow(d, 5);
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

    for (let i = 0; i < vertices.length; i++) {
      const v = vertices[i]
      const ix = i % (CHUNK_SIZE + 1);
      const iz = (i / (CHUNK_SIZE + 1)) >> 0;

      // Generate height using Perlin noise
      v.x = gridPos.x * GRID_SIZE + ix - CHUNK_SIZE * 0.5;
      v.z = gridPos.z * GRID_SIZE + iz - CHUNK_SIZE * 0.5;
      v.y = this.getHeightAt(v.x, v.z);
    }

    this.updateGeometry(true);
  }

  polygonProgram(p, camera) {
    p = p.clone();
    const center = p.center.applyTransform(camera.transform);
    p.color = p.color.mix(Color.GREEN.mul(0.13), 0.85).hueRotate(center.y * 200);

    return p;
  }
}
