import { GNode } from "./gnode.js";

export class Scene extends GNode {
  /** @type { import('./camera3d.js').Camera3D | null } */
  camera = null;

  /** @virtual */
  begin() {}

  /** @virtual */
  exit() {}

  /** 
   * @param { number } dt 
   * @param { CanvasRenderingContext2D } ctx
   * @virtual
   */
  bg(dt, ctx) {}

  /** 
   * @param { number } dt 
   * @param { CanvasRenderingContext2D } ctx
   * @virtual
   */
  gui(dt, ctx) {}

  _process(dt, ctx) {
    this.bg(dt, ctx);
    ctx.save();
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    super._process(dt, ctx);
    ctx.restore();
    this.gui(dt, ctx);
  }

  addChild(child) {
    super.addChild(child);
    child.scene = this;
    child.children.forEach(c => c.scene = this);

    return child;
  }
}
