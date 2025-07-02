import { Vec3 } from '../core/vec3.js';
import { GeometryNode } from '../core/geometryNode.js';
import { GNode3D } from '../core/node3d.js';
import { getNormal } from '../core/utils.js';
import { Basis } from '../core/basis.js';
import { Color } from '../core/color.js';

export class Player extends GNode3D {
  velocity = Vec3.ZERO;
  keyboard = {};
  model = null;
  modelBasis = Basis.IDENTITY.rotate(Vec3.UP, Math.PI);
  turnValue = 0;
  movementSpeed = 2;
  debug = false;

  get camera() {
    return this.scene.camera;
  }

  get targetCameraPosition() {
    if (!this.model) return this.position.add(Vec3.UP.mul(0.6));

    return this.position
      .add(this.model.globalTransform.basis.forward.mul(5))
      .add(this.model.globalTransform.basis.up.mul(3.0));
  }

  async enterTree() {
    this.model = new GeometryNode()
      .assignGeometry(await GeometryNode.importFromObj('/assets/sedan-sports.obj'));

    this.model.basis = this.model.basis.multiply(this.modelBasis);

    this.addChild(this.model);

    window.addEventListener('keydown', (e) => this.keyboard[e.key] = 1);
    window.addEventListener('keyup', (e) => this.keyboard[e.key] = 0);

    this.camera.position = this.targetCameraPosition;
    this.camera.basis = this.transform.basis;
  }

  processCamera(dt) {
    if (!this.model) return;
    this.camera.position = this.camera.position
      .lerp(this.targetCameraPosition, 10 * dt);

    this.camera.basis = this.camera.basis
      .slerp(this.model.globalTransform.basis, 4 * dt);
  }

  processMovement(dt) {

    const forward = (this.keyboard['w'] ?? 0) - (this.keyboard['s'] ?? 0);
    const rotateRight = (this.keyboard['d'] ?? 0) - (this.keyboard['a'] ?? 0);

    this.turnValue -= (this.turnValue - rotateRight) * dt * 5;
    this.velocity = this.velocity
      .add(Vec3.FORWARD.mul(this.movementSpeed * dt * forward));

    const sign = this.velocity.dot(Vec3.FORWARD) < 0 ? 1 : -1;
    const rotationSpeed = Math.min(1, this.velocity.length) * sign;

    this.basis
      .rotate(this.basis.up, this.turnValue * rotationSpeed * dt);

    this.position = this.position
      .add(this.velocity.mul(dt)
      .applyBasis(this.basis));

    this.velocity = this.velocity
      .lerp(Vec3.ZERO, dt); // Dampen the velocity
  }

  processGravity(dt) {
    const p1 = this.basis.forward.mul(0.3).add(this.basis.left.mul(0.125)).add(this.position);
    const p2 = this.basis.forward.mul(0.3).add(this.basis.right.mul(0.125)).add(this.position);
    const p3 = this.basis.forward.mul(-0.3).add(this.basis.left.mul(0.125)).add(this.position);
    const p4 = this.basis.forward.mul(-0.3).add(this.basis.right.mul(0.125)).add(this.position);

    const h1 = p1.mul(Vec3.XZ).add(Vec3.UP.mul(this.scene.terrain.getHeightAt(p1.x, p1.z)));
    const h2 = p2.mul(Vec3.XZ).add(Vec3.UP.mul(this.scene.terrain.getHeightAt(p2.x, p2.z)));
    const h3 = p3.mul(Vec3.XZ).add(Vec3.UP.mul(this.scene.terrain.getHeightAt(p3.x, p3.z)));
    const h4 = p4.mul(Vec3.XZ).add(Vec3.UP.mul(this.scene.terrain.getHeightAt(p4.x, p4.z)));

    if (this.debug) {
      this.camera.drawLine(h1, h2,Color.RED, true);
      this.camera.drawLine(h3, h4,Color.RED, true);
      this.camera.drawLine(h1, h3, Color.RED, true);
      this.camera.drawLine(h2, h4, Color.RED, true);
    }

    const n1 = getNormal(h1, h2, h3);
    const n2 = getNormal(h2, h4, h3);
    const targetY = (h1.y + h2.y + h3.y + h4.y) / 4;
    const normal = n1.add(n2).normalized;

    if (this.position.y - 0.01 > targetY) {
      this.velocity = this.velocity.add(Vec3.UP.mul(-2.0 * dt)); // Gravity
    }

    if (this.debug) {
      this.camera.drawLine(this.position, this.position.add(normal.mul(0.5)), Color.GREEN, true);
    }

    if (!this.model) return;

    this.modelBasis = Object.assign(Basis.IDENTITY, { up: normal });
    this.model.basis = this.model.basis.slerp(this.modelBasis, dt * 10);
    this.model.basis.rotate(this.basis.forward, this.turnValue * 0.025 * Math.PI / 2); 
    this.model.basis.scale = new Vec3(0.125, 0.125, 0.125);

    const targetPos = Math.max(targetY, this.position.y);
    this.position.y -= (this.position.y - targetPos) * dt * 4;
    this.position.y -= (this.position.y - Math.max(this.position.y, targetPos)) * dt * 2;
  }

  /**
    * @param { number } dt - Delta time in seconds.
    */
  process(dt) {
    this.processCamera(dt);
    this.processMovement(dt);
    this.processGravity(dt);
  }
}
