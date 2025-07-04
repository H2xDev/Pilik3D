import { GNode3D } from './node3d.js';
import { Color } from './color.js';
import { Vec3 } from "./vec3.js";
import { Polygon } from "./polygon.js";
import { OBJImporter } from './importers/obj.js';

import { AABB } from './aabb.js';

export class GeometryNode extends GNode3D {
  // DEFAULT CUBE
  //
  /** @type { Vec3[] } */
  vertices = [];

  /** @type { Vec3[] } */
  normals = [];

  /** @type { number[] } */
  indices = [];

  /** @type { number[] } */
  normalIndices = [];

  /** @type { Color[] } */
  colors = [];

  /** @type { Polygon[] } */
  polygons = [];

  aabb = new AABB();

  debug = {
    showNormals: false,
    showAABB: false,
  }

  passDepth = false;

  enterTree() {
    this.updateGeometry();
  }

  assignGeometry(geometry) {
    this.vertices = geometry.vertices;
    this.normals = geometry.normals;
    this.indices = geometry.indices;
    this.normalIndices = geometry.normalIndices;
    this.colors = geometry.colors;

    this.updateGeometry();
    return this;
  }

  updateGeometry() {
    this.polygons = [];
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (let i = 0; i < this.indices.length; i += 3) {
      const pi = (i / 3) >> 0;
      const v1 = this.vertices[this.indices[i]];
      const v2 = this.vertices[this.indices[i + 1]];
      const v3 = this.vertices[this.indices[i + 2]];
      const color = this.colors[pi] || Color.WHITE;
      const n1 = this.normals[this.normalIndices[i] || this.indices[i]];
      const n2 = this.normals[this.normalIndices[i + 1] || this.indices[i + 1]];
      const n3 = this.normals[this.normalIndices[i + 2] || this.indices[i + 2]];

      minX = Math.min(minX, v1.x, v2.x, v3.x);
      minY = Math.min(minY, v1.y, v2.y, v3.y);
      minZ = Math.min(minZ, v1.z, v2.z, v3.z);
      maxX = Math.max(maxX, v1.x, v2.x, v3.x);
      maxY = Math.max(maxY, v1.y, v2.y, v3.y);
      maxZ = Math.max(maxZ, v1.z, v2.z, v3.z);

      let normal = Vec3.UP;
      if (n1 && n2 && n3) {
        normal = n1.add(n2).add(n3).div(3).normalized;
      }

      this.polygons.push(Object.assign(new Polygon(), {
        v1, v2, v3, color, normal, geometryNode: this,
      }));
    }

    this.aabb.size.set(maxX - minX, maxY - minY, maxZ - minZ);
    this.aabb.center.set(
      (maxX + minX) / 2,
      (maxY + minY) / 2,
      (maxZ + minZ) / 2
    );
  }
}
