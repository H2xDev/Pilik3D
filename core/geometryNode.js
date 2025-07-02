import { GNode3D } from './node3d.js';
import { Color } from './color.js';
import { Vec3 } from "./vec3.js";
import { Polygon } from "./polygon.js";
import { OBJImporter } from './importers/obj.js';


export class GeometryNode extends GNode3D {
  /** @param { string } url */
  static async importFromObj(url) {
    const data = await OBJImporter.import(url);
    return Object.assign(new GeometryNode(), data);
  }

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
    for (let i = 0; i < this.indices.length; i += 3) {
      const pi = (i / 3) >> 0;
      const v1 = this.vertices[this.indices[i]];
      const v2 = this.vertices[this.indices[i + 1]];
      const v3 = this.vertices[this.indices[i + 2]];
      const color = this.colors[pi] || Color.WHITE;
      const n1 = this.normals[this.normalIndices[i] || this.indices[i]];
      const n2 = this.normals[this.normalIndices[i + 1] || this.indices[i + 1]];
      const n3 = this.normals[this.normalIndices[i + 2] || this.indices[i + 2]];

      let normal = Vec3.UP;
      if (n1 && n2 && n3) {
        normal = n1.add(n2).add(n3).div(3).normalized;
      }

      this.polygons.push(Object.assign(new Polygon(), {
        v1, v2, v3, color, normal 
      }));
    }
  }
}
