import { Basis } from "./basis.js";
import { Vec3 } from "./vec3.js";

export class Transform3D {
  basis = Basis.IDENTITY;
  position = Vec3.ZERO;

  static get IDENTITY() {
    return new Transform3D(Basis.IDENTITY, Vec3.ZERO);
  }

  get inverse() {
    const inverseBasis = this.basis.inverse;
    const inversePosition = this.position.mul(-1).applyBasis(inverseBasis);
    return new Transform3D(inverseBasis, inversePosition);
  }
  
  /**
    * Applies one Transform3D to another.
    * @param { Transform3D } other
    */
  multiply(other) {
    const newBasis = this.basis.multiply(other.basis);
    const newPosition = this.basis.x.mul(other.position.x)
      .add(this.basis.y.mul(other.position.y))
      .add(this.basis.z.mul(other.position.z))
      .add(this.position);
  
    return new Transform3D(newBasis, newPosition);
  }

  constructor(basis = Basis.IDENTITY, position = Vec3.ZERO) {
    Object.assign(this, { basis, position });
  }
}
