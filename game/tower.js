import { BoxGeometry } from "@core/importers/box.js";
import { CylinderGeometry } from "@core/importers/cylinder.js";
import { Basis, Color, GeometryNode, Vec3 } from "@core/index.js";
import { TowerBullet } from "./towerBullet.js";

export class Tower extends GeometryNode {
  radius = 0.3;
  height = 1.0;
  rotationSpeed = 20.0;

  /** @type { GeometryNode } */
  trunk = null;
  trunkLength = 0.5;

  shootInterval = 1.0;

  constructor(radius = 0.3, height = 0.5) {
    super(new BoxGeometry(radius, height, radius));
    this.radius = radius;
    this.height = height;
    this.position.y += height * 0.5;

    const trunkCylinder = new CylinderGeometry(0.1, this.trunkLength, 4, Vec3.UP.mul(this.trunkLength * 0.5));
    this.trunk = this.addChild(new GeometryNode(trunkCylinder));
    this.trunk.basis = Basis.IDENTITY.rotated(Vec3.LEFT, Math.PI / 2);
    this.trunk.position.y += this.height * 0.5 - 0.1;

    this.trunk.polygonProgram = (polygon) => {
      polygon.color = Color.RED;

      return polygon;
    }
  }

  process(dt) {
    const delta = (this.scene.player.globalPosition.add(this.scene.player.velocity))
      .sub(this.globalPosition).xz;

    const x = this.scene.player.globalPosition.sub(this.trunk.globalPosition).length;
    const y = this.scene.player.globalPosition.y - this.trunk.globalPosition.y;
    const trunkAngle = Math.atan2(y, x) + Math.PI / 2;

    const angle = Math.atan2(delta.z, delta.x) + Math.PI / 2;
    const targetBasis = Basis.IDENTITY.rotated(Vec3.UP, angle);
    const trunkTargetBasis = Basis.IDENTITY.rotated(Vec3.LEFT, trunkAngle);

    this.basis = this.basis.slerp(targetBasis, dt * this.rotationSpeed);
    this.trunk.basis = this.trunk.basis.slerp(trunkTargetBasis, dt * this.rotationSpeed);

    if (this.scene.time % this.shootInterval < dt) {
      this.shoot();
    }
  }

  shoot() {
    const bullet = new TowerBullet();
    bullet.basis.forward = this.trunk.globalTransform.basis.up.mul(-1);
    bullet.globalPosition = this.trunk.globalPosition
    this.scene.addChild(bullet);
  }
}
