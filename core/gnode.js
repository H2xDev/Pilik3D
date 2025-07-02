import { assert } from "./utils.js";
import { UUID } from "./uuid.js";

export class GNode {
  id = UUID.generate();

  /** @type { GNode[] } */
  children = [];

  /** @type { GNode | null } */
  parent = null;

  /** @type { import('./scene.js').Scene | null } */
  scene = null;

  /** @type { string } */
  name = "GNode";

  enabled = true;

  /** @virtual */
  enterTree() {}

  /** 
   * @param { number } dt - Delta time since last frame
   * @param { CanvasRenderingContext2D } ctx - Context for the current frame
   * @virtual 
   */
  process(dt, ctx) {}

  /**
   * For internal use only. Processes the node and its children.
   * @param { number } dt - Delta time since last frame
   * @param { CanvasRenderingContext2D } ctx - Context for the current frame
   */
  _process(dt, ctx) {
    if (!this.enabled) return;
    this.process(dt, ctx);
    this.children.forEach(child => child._process(dt, ctx));
  }

  /** @param { GNode } child - The child node to add */
  addChild(child) {
    assert(child instanceof GNode, "Child must be an instance of GNode");

    child.parent = this;
    this.children.push(child);
    child.enterTree();
    child.children.forEach(c => c.enterTree());

    return child;
  }
}
