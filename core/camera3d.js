// @ts-check
import { Color } from "./color.js";
import { GeometryNode } from "./geometryNode.js";
import { GNode } from "./gnode.js";
import { GNode3D } from "./node3d.js";
import { PointLight } from "./light.js";
import { DirectionalLight } from "./directionalLight.js";
import { Polygon } from "./polygon.js";
import { DEG_TO_RAD } from "./utils.js";
import { Vec3 } from "./vec3.js";
import { Fog } from "./fog.js";

export class Camera3D extends GNode3D {
  fov = 90;
  perspective = 1;
  ctx = null;
  far = 10;

  constructor() {
    super();
    this.makeCurrent();
  }

  /** 
    * @param { GNode } node
    * @param { GeometryNode[] } geometries
    * @returns GeometryNode[] 
    */
  getAllGeometryNodes(node, geometries = []) {
    if (node instanceof GeometryNode) {
      geometries.push(node);
    }

    for (const child of node.children) {
      this.getAllGeometryNodes(child, geometries);
    }

    return geometries;
  }

  getAllLightNodes(node, lights = []) {
    if (node instanceof PointLight) {
      lights.push(node);
    }

    for (const child of node.children) {
      this.getAllLightNodes(child, lights);
    }

    return lights;
  }

  /**
    * @param { GeometryNode[] } geometries
    * @param { PointLight[] } lights
    */
  renderGeometries(geometries, lights) {
    let polugonsRendered = 0;

    // Filter out polygons that are behind the camera or facing away from the camera
    geometries
      .flatMap((geometry) => geometry.polygons.map(polygon => {
        polygon = polygon.applyTransform(geometry.globalTransform);

        if (polygon.center.sub(this.transform.position).length > this.far) return null; // Skip polygons that are too far away

        // Frustum culling
        const viewDir = polygon.center.sub(this.transform.position.sub(this.basis.forward.mul(0.5))).normalized;
        const cosHalfFov = Math.cos(this.fov);
        const cosAngle = viewDir.dot(this.basis.forward);
        if (cosAngle < cosHalfFov) return null;

        // FIXME: There's something wrong with the normal or with the camera's forward vector.
        //        In case the condition "> 0" the camera doesn't rendering polygons that still 
        //        facing the camera. Still trying to figure out why.
        if (polygon.normal.dot(this.basis.forward) > 0.7) return null;

        return polygon.applyTransform(this.transform.inverse);
      }))
      // Filter out null polygons
      .filter(Boolean)
      // Painter's algorithm: sort polygons by their minimum z value
      .sort((a, b) => {
        const az = Math.min(a.v1.z, a.v2.z, a.v3.z);
        const bz = Math.min(b.v1.z, b.v2.z, b.v3.z);

        return az - bz;
      })
      .forEach(polygon => {
        let color = polygon.color;

        color = DirectionalLight.current?.processPolygon(this, polygon) || color;

        lights.forEach(light => {
          color = light.processPolygon(this, polygon, color);
        });

        color = Fog.current.processPolygon(this, polygon, color);
        
        this.renderPolygon(polygon, color);

        // Draw the polygon's normal vector
        if (polygon.geometryNode.debug.showNormals) {
          this.drawLine(polygon.center, polygon.center.add(polygon.normal.mul(0.05)), Color.RED);
        }

        polugonsRendered++;
      });
  }

  process(dt, ctx) {
    this.ctx = ctx;
    this.perspective = (ctx.canvas.height / 2) / Math.tan(this.fov * DEG_TO_RAD / 2)

    const geometries = this.getAllGeometryNodes(this.scene);
    const lights = this.getAllLightNodes(this.scene);

    const allGeometries = geometries
      // NOTE: Skip geometries that are behind the camera
      .filter(geometry => geometry.enabled && geometry.aabb.vertices.some(v => v
        .applyTransform(geometry.globalTransform)
        .applyTransform(this.transform.inverse).z <= 0))

    const regularRender = allGeometries.filter(geometry => !geometry.passDepth);
    const backgroundRender = allGeometries.filter(geometry => geometry.passDepth);

    this.renderGeometries(backgroundRender, lights);
    this.renderGeometries(regularRender, lights);

    geometries
      .filter(geometry => geometry.debug.showAABB)
      .forEach(geometry => this.renderAABB(geometry, Color.WHITE));
  }

  /**
    * @param { Polygon } polygon
    * @param { Color } color
    */
  renderPolygon(polygon, color) {
    const p1 = this.toScreenSpace(polygon.v1);
    const p2 = this.toScreenSpace(polygon.v2);
    const p3 = this.toScreenSpace(polygon.v3);

    const minY = Math.min(p1.y, p2.y, p3.y);
    const maxY = Math.max(p1.y, p2.y, p3.y);

    // Skip polygons that are filling the whole screen
    if (minY < 10 && maxY > this.ctx.canvas.height - 10) return;

    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.lineTo(p3.x, p3.y);
    this.ctx.closePath();
    color.assign(this.ctx);
    this.ctx.fill();
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = 2;
    // color.hueRotate(-15).assign(this.ctx);
    this.ctx.stroke();
  }

  /**
    * @param { GNode3D } node3d
    * @param { Color } [color=Color.WHITE]
    */
  renderAABB(node3d, color = Color.WHITE) {
    const { vertices } = node3d.aabb;

    const points = vertices.map(point => point.applyTransform(node3d.globalTransform));

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    edges.forEach(([start, end]) => {
      this.drawLine(points[start], points[end], color, true);
    });
  }

  drawLine(v1, v2, color = Color.WHITE, doTransform = false) {
    const p1 = this.toScreenSpace(v1, doTransform);
    const p2 = this.toScreenSpace(v2, doTransform);

    if (p1.z > 0 || p2.z > 0) return; // Skip lines that are behind the camera

    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.lineWidth = 2;
    color.assign(this.ctx);
    this.ctx.stroke();
  }

  /**
    * @param { Vec3 } center
    * @param { number } radius
    * @param { Color } [color=Color.WHITE]
    */
  drawCircle(center, radius, color = Color.WHITE) {
    const p = this.toScreenSpace(center);
    if (p.z > 0) return; // Skip circles that are behind the Camera3D
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, Math.max(0.001, 1.0 - radius / p.z), 0, Math.PI * 2);
    color.assign(this.ctx);
    this.ctx.fill();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = color.mul(0.7).toString();
    this.ctx.stroke();
  }

  /** @param { Vec3 } point */
  toScreenSpace(point, doTransform = false) {
    if (doTransform) {
      point = point.applyTransform(this.transform.inverse);
    }

    const z = -Math.max(-point.z, 0.001); // Prevent division by zero

    const x = (point.x / z) * this.perspective;
    const y = (point.y / z) * this.perspective;

    return new Vec3(x, y, z);
  }

  makeCurrent() {
    Camera3D.current = this;
  }
}
