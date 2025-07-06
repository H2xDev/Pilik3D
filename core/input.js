import { GNode } from "./gnode.js";

class InputAction {
  key = null;
  pressed = false;
}

export class Input extends GNode {
  /** @type { Record<string, InputAction> } */
  actions = {};
  static Events = {
    ...GNode.Events,
    ACTION_PRESSED: "actionPressed",
    ACTION_RELEASED: "actionReleased",
  }

  /**
    * Creates an Input instance that listens for keydown and keyup events.
    * @param { Record<string, string> } actions - An object mapping action names to InputAction instances.
    */
  constructor(actions = {}) {
    super();
    document.addEventListener("keydown", (event) => this.processActions(event.code, true));
    document.addEventListener("keyup", (event) => this.processActions(event.code, false));

    for (const actionName in actions) {
      this.registerAction(actionName, actions[actionName]);
    }
  }

  /** @param { string } keyCode */
  processActions(keyCode, pressed) {
    for (const actionName in this.actions) {
      const action = this.actions[actionName];
      if (!action.key || action.key !== keyCode) continue;
      action.pressed = pressed;

      this.trigger(pressed ? Input.Events.ACTION_PRESSED : Input.Events.ACTION_RELEASED, actionName);
    }
  }

  /**
    * @param { string } name - The name of the action to register.
    * @param { string } key - The key code associated with the action (e.g., "KeyW", "KeyA").
    */
  registerAction(name, key) {
    if (!this.actions[name]) {
      this.actions[name] = new InputAction();
    }

    this.actions[name].key = key;
  }

  isActionPressed(name) {
    const action = this.actions[name];
    return action ? action.pressed : false;
  }

  getAxis(xpos, xneg, ypos, yneg) {
    let x = 0;
    let y = 0;

    if (this.isActionPressed(xpos)) x += 1;
    if (this.isActionPressed(xneg)) x -= 1;
    if (this.isActionPressed(ypos)) y += 1;
    if (this.isActionPressed(yneg)) y -= 1;

    return { x, y };
  }
}
