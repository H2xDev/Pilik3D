import { Vec3 } from './vec3.js';

export class Basis {
  x = new Vec3(1, 0, 0);
  y = new Vec3(0, 1, 0);
  z = new Vec3(0, 0, 1);

  /**
   * Creates a new Basis object.
   * @param { Vec3 } x The x-axis vector.
   * @param { Vec3 } y The y-axis vector.
   * @param { Vec3 } z The z-axis vector.
   */
  constructor(
    x = new Vec3(1, 0, 0),
    y = new Vec3(0, 1, 0),
    z = new Vec3(0, 0, 1)
  ) {
    Object.assign(this, { x, y, z });
  }

  static get IDENTITY() {
    return new Basis(
      new Vec3(1, 0, 0),
      new Vec3(0, 1, 0),
      new Vec3(0, 0, 1)
    );
  }

  get inverse() {
    return new Basis(
      new Vec3(this.x.x, this.y.x, this.z.x),
      new Vec3(this.x.y, this.y.y, this.z.y),
      new Vec3(this.x.z, this.y.z, this.z.z)
    );
  }

  get forward() {
    return this.z.mul(-1);
  }

  get up() {
    return this.y.mul(-1);
  }

  get right() {
    return this.x.mul(-1);
  }

  get down() {
    return this.z;
  }

  get left() {
    return this.x;
  }

  get backward() {
    return this.y;
  }

  /**
   * Rotates the basis around a given axis by a specified angle.
   * @param {Vec3} axis - The axis to rotate around.
   * @param {number} angle - The angle in radians to rotate.
   */
  rotate(axis, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;
  
    const x = axis.x;
    const y = axis.y;
    const z = axis.z;
  
    // 3x3 rotation matrix (row-major)
    const rotationMatrix = [
      t * x * x + c,     t * x * y - s * z, t * x * z + s * y,
      t * y * x + s * z, t * y * y + c,     t * y * z - s * x,
      t * z * x - s * y, t * z * y + s * x, t * z * z + c
    ];
  
    // Сохраняем старые значения
    const oldX = this.x;
    const oldY = this.y;
    const oldZ = this.z;
  
    this.x = oldX.mul(rotationMatrix[0]).add(oldY.mul(rotationMatrix[1])).add(oldZ.mul(rotationMatrix[2]));
    this.y = oldX.mul(rotationMatrix[3]).add(oldY.mul(rotationMatrix[4])).add(oldZ.mul(rotationMatrix[5]));
    this.z = oldX.mul(rotationMatrix[6]).add(oldY.mul(rotationMatrix[7])).add(oldZ.mul(rotationMatrix[8]));
  
    return this;
  }

  /**
   * Scales the basis by a scalar or another Vec3.
   * @param {Vec3 | number } scalar
   */
  scale(scalar) {
    if (scalar instanceof Vec3) {
      this.x = this.x.mul(scalar.x);
      this.y = this.y.mul(scalar.y);
      this.z = this.z.mul(scalar.z);
      return this;
    }

    this.x = this.x.mul(scalar);
    this.y = this.y.mul(scalar);
    this.z = this.z.mul(scalar);

    return this;
  }

  /**
    * Spherically interpolates between this basis and another basis.
    *
    * @param { Basis } basis
    * @param { number } t
    */
  slerp(basis, t) {
    const x = this.x.slerp(basis.x, t);
    const y = this.y.slerp(basis.y, t);
    const z = this.z.slerp(basis.z, t);

    return new Basis(x, y, z);
  }

  /**
    * @param { Basis } other
    */
  multiply(other) {
    return new Basis(
      new Vec3(
        this.x.dot(new Vec3(other.x.x, other.y.x, other.z.x)),
        this.x.dot(new Vec3(other.x.y, other.y.y, other.z.y)),
        this.x.dot(new Vec3(other.x.z, other.y.z, other.z.z))
      ),
      new Vec3(
        this.y.dot(new Vec3(other.x.x, other.y.x, other.z.x)),
        this.y.dot(new Vec3(other.x.y, other.y.y, other.z.y)),
        this.y.dot(new Vec3(other.x.z, other.y.z, other.z.z))
      ),
      new Vec3(
        this.z.dot(new Vec3(other.x.x, other.y.x, other.z.x)),
        this.z.dot(new Vec3(other.x.y, other.y.y, other.z.y)),
        this.z.dot(new Vec3(other.x.z, other.y.z, other.z.z))
      )
    );
  }

  /**
    * @param { Vec3 } target
    * @param { Vec3 } up
    */
  lookAt(target, up = Vec3.UP) {
    const z = target.normalized.mul(-1);
    const x = up.cross(z).normalized;
    const y = z.cross(x).normalized;

    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  }

  toString() {
    return `Basis(
      x: ${this.x.toString()},
      y: ${this.y.toString()},
      z: ${this.z.toString()}
    )`;
  }
}
