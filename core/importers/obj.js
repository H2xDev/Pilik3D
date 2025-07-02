import { Color } from "../color.js";
import { assert } from "../utils.js";
import { Vec3 } from "../vec3.js";

export class OBJImporter {
  static async import(url) {
    /** @type { Vec3[] } */
    const vertices = [];

    /** @type { Vec3[] } */
    const normals = [];

    /** @type { number[] } */
    const normalIndices = [];

    /** @type { number[] } */
    const indices = [];

    /** @type { Color[] } */
    const colors = [];

    const data = await fetch(url).then(response => response.text())
    assert(data, 'Failed to fetch OBJ data');

    let currentColor = Color.WHITE;

    data.split('\n').forEach(line => {
      const [marker, ...args] = line.trim().split(/\s+/);

      switch (marker) {
        case 'v': // Vertex
          const v = new Vec3(...args.slice(0, 3).map(Number));
          vertices.push(v);
          break;

        case 'fc': // Color
          currentColor = new Color(args[0]);
          break;

        case 'vn': // Vertex normal
          const normal = new Vec3(...args.map(Number));
          normals.push(normal);
          break;

        case 'f': // Face
          const vindices = args.map(arg => arg.split('/')[0]).map(Number).map(i => i - 1); // OBJ indices are 1-based
          const nindices = args.map(arg => arg.split('/')[2]).map(Number).map(i => i - 1); // OBJ normals are also 1-based

          indices.push(...vindices);
          normalIndices.push(...nindices);
          colors.push(currentColor); // Use the current color for this face
          break;

        case 'bp': // Bone attachment position
          break;

        default: break;
      }
    })

    return {
      vertices,
      normals,
      indices,
      normalIndices,
      colors,
    }
  }
}
