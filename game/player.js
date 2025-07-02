import { Vec3 } from '../core/vec3.js';
import { GeometryNode } from '../core/geometryNode.js';
import { GNode3D } from '../core/node3d.js';

export class Player extends GNode3D {
  velocity = Vec3.ZERO;
  keyboard = {};
  model = null;

  async enterTree() {
    this.model = new GeometryNode();
    this.model.assignGeometry(await GeometryNode.importFromObj('/assets/sedan-sports.obj'))
    this.model.transform.basis.scale(new Vec3(0.25, 0.25, 0.25));
    this.model.transform.basis.rotate(Vec3.UP, Math.PI);
    this.addChild(this.model);

    window.addEventListener('keydown', (e) => {
      this.keyboard[e.key] = 1;
    });
    window.addEventListener('keyup', (e) => {
      this.keyboard[e.key] = 0;
    });
  }

  process(dt, ctx) {
    const targetPos = this.transform.position
      .add(this.transform.basis.forward.mul(-2))
      .add(Vec3.UP.mul(0.6));

    this.scene.camera.transform.position = this.scene.camera.transform.position
      .lerp(targetPos, 3 * dt);

    this.scene.camera.transform.basis = this.scene.camera.transform.basis
      .slerp(this.transform.basis, 3 * dt);

    const forward = (this.keyboard['w'] ?? 0) - (this.keyboard['s'] ?? 0);
    const rotateLeft = (this.keyboard['a'] ?? 0) - (this.keyboard['d'] ?? 0);
    this.velocity = this.velocity
      .add(Vec3.FORWARD.mul(5 * dt * forward));

    const sign = this.velocity.dot(Vec3.FORWARD) < 0 ? -1 : 1;
    const speed = Math.min(1, this.velocity.length) * sign;

    this.transform.basis.rotate(this.transform.basis.up, -rotateLeft * speed * dt);
    this.transform.position = this.transform.position
      .add(this.velocity.mul(dt)
      .applyBasis(this.transform.basis));

    this.velocity = this.velocity
      .lerp(Vec3.ZERO, dt); // Dampen the velocity
  }
}
