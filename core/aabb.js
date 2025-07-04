import { Vec3 } from './vec3.js';

export class AABB {
  size = new Vec3(1, 1, 1);
  center = new Vec3(0, 0, 0);

  get vertices() {
    const halfSize = this.size.mul(0.5);
    return [
      new Vec3(this.center.x - halfSize.x, this.center.y - halfSize.y, this.center.z - halfSize.z),
      new Vec3(this.center.x + halfSize.x, this.center.y - halfSize.y, this.center.z - halfSize.z),
      new Vec3(this.center.x + halfSize.x, this.center.y + halfSize.y, this.center.z - halfSize.z),
      new Vec3(this.center.x - halfSize.x, this.center.y + halfSize.y, this.center.z - halfSize.z),
      new Vec3(this.center.x - halfSize.x, this.center.y - halfSize.y, this.center.z + halfSize.z),
      new Vec3(this.center.x + halfSize.x, this.center.y - halfSize.y, this.center.z + halfSize.z),
      new Vec3(this.center.x + halfSize.x, this.center.y + halfSize.y, this.center.z + halfSize.z),
      new Vec3(this.center.x - halfSize.x, this.center.y + halfSize.y, this.center.z + halfSize.z)
    ];
  }
}
