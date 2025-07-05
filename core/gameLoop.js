import { Scene } from "./scene.js";
import { assert } from "./utils.js";

export class GameLoop {
	canvas = document.createElement("canvas");
	ctx = this.canvas.getContext("2d");
	running = false;

	/** @type { Scene } */
	scene = null;

	#lastTimestamp = 0;
	#renderLoop(timestamp = 0) {
		const DELTA_TIME = (timestamp - (this.#lastTimestamp || timestamp)) / 1000;

    if (DELTA_TIME > 0.1) {
      // Prevent too large delta time
      console.warn("Large delta time detected, clamping to 0.1s");
      return this.#renderLoop(0);
    }

		this.#lastTimestamp = timestamp;
		if (!this.running) return;
		assert(this.scene, "Scene is not set for rendering");

		this.scene._process(DELTA_TIME, this.ctx);
		requestAnimationFrame(this.#renderLoop.bind(this));
	}

	changeScene(scene) {
		assert(this.ctx, "Canvas 2D context is not available");
		if (this.scene) this.scene.exit();
		this.scene = scene;
		this.scene.begin();

		return this;
	}

	setup(options = {}) {
		Object.assign(this.canvas, options);
		Object.assign(this.canvas.style, options.style || {});
		return this;
	}

	mountTo(element) {
		element.appendChild(this.canvas);
		return this;
	}

	/** @param { Scene | null } sceneToRender */
	begin() {
		this.running = true;
		assert(this.ctx, "Canvas 2D context is not available");
		this.#renderLoop();
	}
}
