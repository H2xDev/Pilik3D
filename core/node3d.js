import { GNode } from "./gnode.js";
import { Transform3D } from "./transform3d.js";

export class GNode3D extends GNode {
  /** @type { Transform3D } */
  transform = Transform3D.IDENTITY;

  get basis() {
    return this.transform.basis;
  }

  set basis(value) {
    this.transform.basis = value;
  }

  get position() {
    return this.transform.position;
  }

  set position(value) {
    this.transform.position = value;
  }

  get globalTransform() {
    if (this.parent && this.parent instanceof GNode3D) {
      return this.parent.globalTransform.multiply(this.transform);
    }

    return this.transform;
  }
}
