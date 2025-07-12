import { GNode } from "@core/index.js";

const DRIFT_CONSTANT = 300;
const FLY_CONSTANT = 500;
const COOLNESS_TEXT = "Coolness score";

export class GameManager extends GNode {
  driftVelocity = 0;
  flyVelocity = 0;
  coolScore = 0;

  get camera() {
    return this.scene.camera;
  }

  get songManager() {
    return this.scene.songManager;
  }

  get player() {
    return this.scene.player;
  }

  process(deltaTime) {
    this.driftVelocity = Math.round(this.player.driftValue * DRIFT_CONSTANT * deltaTime);
    this.flyVelocity = Math.round(this.player.flyValue * FLY_CONSTANT * deltaTime);

    this.coolScore += this.driftVelocity;
    this.coolScore += this.flyVelocity;
  }

  gui(deltaTime, ctx) {
    ctx.fillStyle = "white";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "24px 'Press Start 2P'";
    ctx.fillText(COOLNESS_TEXT, ctx.canvas.width / 2, 60);
    ctx.font = "48px 'Press Start 2P'";

    ctx.save()
    ctx.translate(ctx.canvas.width / 2, 128);
    ctx.scale(1 + this.songManager.midValue * 0.5, 1 + this.songManager.bassValue * 0.5);
    ctx.fillStyle = "pink";
    ctx.fillText(this.coolScore, 0, 4);

    ctx.fillStyle = "white";
    ctx.fillText(this.coolScore, 0, 0);
    ctx.restore();

    if (!this.player.model) return;

    const p = this.camera.toScreenSpace(
      this.player.model.globalPosition
        .add(this.player.model.globalTransform.basis.backward.mul(0.35)), true);

    ctx.save();
    ctx.font = "16px 'Press Start 2P'";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.translate(p.x + ctx.canvas.width / 2, p.y + ctx.canvas.height / 2 + 32);
    ctx.scale(1 + this.songManager.trebleValue * 0.5, 1 + this.songManager.trebleValue * 0.5);
    ctx.rotate(this.camera.basis.roll - this.player.model.globalTransform.basis.roll);
    ctx.fillStyle = "white";

    let trick = this.flyVelocity > 0
      ? "COOL FLY " + Math.round(this.flyVelocity / deltaTime) + '/s'
      : this.driftVelocity > 0
        ? "COOL DRIFT " + Math.round(this.driftVelocity / deltaTime) + '/s'
        : "";

    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "cyan";
    ctx.fillText(trick, 0, 2);
    ctx.fillStyle = "white";
    ctx.fillText(trick, 0, 0);
    ctx.restore();
  }
}
