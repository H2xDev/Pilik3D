import { Color } from "../color.js";
import { Vec3 } from "../vec3.js";
import { GeometryBase } from "./base.js";

export class OBJImporter extends GeometryBase {
  /**
    * @param { string } data - The OBJ file content as a string.
    */
  constructor(data) {
    super();
    let currentColor = Color.WHITE;

    data.split('\n').forEach(line => {
      const [marker, ...args] = line.trim().split(/\s+/);

      switch (marker) {
        case 'v': // Vertex
          const v = new Vec3(...args.slice(0, 3).map(Number));
          this.vertices.push(v);
          break;

        case 'fc': // Color
          currentColor = new Color(args[0]);
          break;

        case 'vn': // Vertex normal
          const normal = new Vec3(...args.map(Number));
          this.normals.push(normal);
          break;

        case 'f': // Face
          const vindices = args.map(arg => arg.split('/')[0]).map(Number).map(i => i - 1); // OBJ indices are 1-based
          const nindices = args.map(arg => arg.split('/')[2]).map(Number).map(i => i - 1); // OBJ normals are also 1-based

          const has4Vertices = vindices.length === 4;

          if (has4Vertices) {
            // Split quad into two triangles
            this.indices.push(vindices[0], vindices[1], vindices[2]);
            this.indices.push(vindices[0], vindices[2], vindices[3]);
            this.normalIndices.push(nindices[0], nindices[1], nindices[2]);
            this.normalIndices.push(nindices[0], nindices[2], nindices[3]);
          } else {
            this.indices.push(...vindices);
            this.normalIndices.push(...nindices);
            this.colors.push(currentColor); // Use the current color for this face
          }
          break;

        default: break;
      }
    })
  }
}
