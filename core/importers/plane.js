import { Vec3 } from '../vec3.js';
import { Color } from '../color.js';

export class PlaneGeometry {
  /** @type { Vec3[] } */
  vertices = [];

  /** @type { number[] } */
  indices = [];

  /** @type { Vec3[] } */
  normals = [];

  /** @type { number[] } */
  normalIndices = [];

  /** @type { Color[] } */
  colors = [];

  /**
    * @param { number } sx - Segments in the X direction
    * @param { number } sy - Segments in the Y direction
    */
  constructor(sx, sy) {
    const halfX = sx / 2;
    const halfY = sy / 2;

    // Generate vertices
    for (let y = 0; y <= sy; y++) {
      for (let x = 0; x <= sx; x++) {
        this.vertices.push(new Vec3(
          (x / sx) * sx - halfX,
          0,
          (y / sy) * sy - halfY,
        ));
      }
    }

    // Generate indices
    for (let y = 0; y < sy; y++) {
      for (let x = 0; x < sx; x++) {
        const i1 = y * (sx + 1) + x;
        const i2 = i1 + 1;
        const i3 = i1 + (sx + 1);
        const i4 = i3 + 1;

        this.indices.push(i1, i2, i3, i2, i4, i3);
      }
    }

    // Normals are all facing up
    this.normals = Array(this.vertices.length).fill(new Vec3(0, 1, 0));

    // Colors can be set to a default color or left empty
    this.colors = Array(this.vertices.length).fill(Color.WHITE);
  }
}
