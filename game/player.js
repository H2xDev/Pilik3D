import { Vec3 } from '../core/vec3.js';
import { GeometryNode } from '../core/geometryNode.js';
import { GNode3D } from '../core/node3d.js';
import { getNormal } from '../core/utils.js';
import { Color } from '../core/color.js';
import { OBJImporter } from '../core/importers/obj.js';
import { getAcceleration, getFrictionRate } from './utils.js';
import { Basis } from '@core/basis.js';

const GRAVITY = 2.81; // Gravity constant

export class Player extends GNode3D {
  velocity = Vec3.ZERO;
  keyboard = {};

  /** @type { GeometryNode } */
  model = null;
  turnVelocity = 0;
  movementSpeed = 10;
  turnSpeed = 5;
  friction = 5;
  debug = false;
  isOnGround = false;
  forwardSpeed = 0;

  /**
    * @param { number } dt - Delta time in seconds.
    */
  process(dt) {
    if (!this.model) return;
    this.processCamera(dt);
    this.processMovement(dt);
    this.processGravity(dt);
  }

  get camera() {
    return this.scene.camera;
  }

  get targetCameraPosition() {
    if (!this.model) return this.position.add(Vec3.UP.mul(0.6));

    const pos = this.position
      .add(this.model.globalTransform.basis.forward
        .mul(-2.0)
        .add(this.camera.basis.forward
          .mul(this.velocity.length * 0.1)))
      .add(this.model.globalTransform.basis.up
        .mul(0.5));

    // NOTE: Prevent camera from going below terrain
    const minY = this.scene.terrain.getHeightAt(pos.x, pos.z) + 0.25;
    pos.y = Math.max(pos.y, minY);

    return pos;
  }

  async enterTree() {
    const modelData = await fetch('/assets/car.obj').then(res => res.text());
    this.model = new GeometryNode()
      .assignGeometry(new OBJImporter(modelData));

    this.addChild(this.model);

    window.addEventListener('keydown', (e) => this.keyboard[e.code] = 1);
    window.addEventListener('keyup', (e) => this.keyboard[e.code] = 0);

    this.camera.position = this.targetCameraPosition;
    this.camera.basis = this.transform.basis;
    this.model.scale = new Vec3(0.125, 0.125, 0.125);
    this.model.debug.showAABB = this.debug;

    this.model.polygonProgram = (polygon, camera3d) => {
      polygon.color = Color.GREEN;
      return polygon;
    }
  }

  processCamera(dt) {
    this.camera.position = this.camera.position
      .lerp(this.targetCameraPosition, 10 * dt);

    const targetBasis = this.model.globalTransform.basis.rotate(this.model.basis.up, this.turnVelocity * 0.2);
    // targetBasis.rotate(this.camera.basis.right, -0.9);

    this.camera.basis = this.camera.basis
      .slerp(targetBasis, 4 * dt);

    this.camera.fov = 50 + this.velocity.length * 10;
  }

  processMovement(dt) {
    const forwardTarget = (this.keyboard['KeyW'] ?? 0) - (this.keyboard['KeyS'] ?? 0);
    const rotateRight = (this.keyboard['KeyD'] ?? 0) - (this.keyboard['KeyA'] ?? 0);

    this.forwardSpeed -= (this.forwardSpeed - forwardTarget) * dt;

    this.position = this.position
      .add(this.velocity.mul(dt));


    if (this.isOnGround) {
      this.rotationSign = this.velocity.mul(Vec3.XZ).dot(this.model.basis.forward) < 0 ? 1 : -1;
      this.turnVelocity += (rotateRight * this.forwardSpeed) * this.velocity.length * -dt;
      this.turnVelocity -= this.turnVelocity * dt;

      const acceleration = getAcceleration(this.movementSpeed, this.friction, dt);

      this.velocity = this.velocity
        .add(this.model.basis.forward.mul(acceleration * dt * this.forwardSpeed));

      this.velocity = this.velocity.mul(getFrictionRate(this.friction, dt));

      if (this.keyboard['Space']) {
        this.velocity = this.velocity.add(this.model.basis.up);
      }

      this.model.basis
        .rotate(this.model.basis.up, this.turnVelocity * dt);
    } else {
      this.model.basis.rotate(Vec3.UP, this.turnVelocity * dt);
    }
  }

  processGravity(dt) {
    const p1 = this.model.basis.forward.mul(0.3).add(this.model.basis.left.mul(0.125)).add(this.position);
    const p2 = this.model.basis.forward.mul(0.3).add(this.model.basis.right.mul(0.125)).add(this.position);
    const p3 = this.model.basis.forward.mul(-0.3).add(this.model.basis.left.mul(0.125)).add(this.position);
    const p4 = this.model.basis.forward.mul(-0.3).add(this.model.basis.right.mul(0.125)).add(this.position);

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

    this.isOnGround = this.position.y - 0.01 <= targetY;

    if (this.position.y - 0.01 > targetY) {
      this.velocity = this.velocity.add(Vec3.UP.mul(-GRAVITY * dt)); // Gravity
    }

    if (this.debug) {
      this.camera.drawLine(this.position, this.position.add(normal.mul(0.5)), Color.GREEN, true);
    }

    if (!this.model) return;

    if (this.isOnGround) {
      const rotationSpeed = Math.min(1, this.velocity.length);

      this.model.basis.up = normal; // Align the model's up vector with the terrain normal
      // Turning tilt
      this.model.basis.rotate(this.model.basis.forward, this.turnVelocity * -0.0125 * Math.PI / 2 * rotationSpeed); 
    }

    const targetPos = Math.max(targetY, this.position.y);
    this.position.y -= (this.position.y - targetPos) * dt * 4;
    this.position.y -= (this.position.y - Math.max(this.position.y, targetPos)) * dt * 10;
  }
}
