export const assert = (condition, message) => {
	if (!condition) {
		throw new Error(message || "Assertion failed");
	}
}

export const DEG_TO_RAD = 1 / 180 * Math.PI;
