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

export class Camera3D extends GNode3D {
  fov = 90;
  perspective = 1;
  ctx = null;

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
    * Process point light for a polygon.
    * @param { Polygon } polygon
    * @param { PointLight } light
    * @param { Color } inColor
    * @returns { Color }
    */
  processPointLight(polygon, light, inColor) {
    const lightPos = light.transform.position
      .applyTransform(light.globalTransform)
      .applyTransform(this.transform.inverse);

    const delta = lightPos.sub(polygon.center)
    const lightDir = delta.normalized;
    const distance = delta.length;
    const percent = Math.max(0, 1 - distance / light.radius);
    const lightShining = Math.pow(Math.max(0, polygon.normal.dot(lightDir)), 3) * percent;
      
    // Debug light position
    this.drawLine(lightPos, lightPos.add(Vec3.UP).mul(0.1), Color.RED);

    return inColor.add(light.color.mul(lightShining));
  }

  /**
    * Process directional light for a polygon.
    *
    * @param { Polygon } polygon
    * @param { Color } inColor
    * @returns { Color }
    */
  processDirectionalLight(polygon, inColor) {
    if (!DirectionalLight.current) return inColor;

    const lightDirection = DirectionalLight.current.transform.basis.forward;
    const lightColor = DirectionalLight.current.color;
    const ambientColor = DirectionalLight.current.ambient;

    const worldNormal = polygon.normal.applyBasis(this.transform.basis);
    const shining = Math.pow(Math.max(0, -worldNormal.dot(lightDirection)), 100);
    
    let color = polygon.color.mul(ambientColor).add(lightColor.mul(shining));
    return color
  }

  process(dt, ctx) {
    this.ctx = ctx;
    this.perspective = (ctx.canvas.height / 2) / Math.tan(this.fov * DEG_TO_RAD / 2)

    const geometries = this.getAllGeometryNodes(this.scene);
    const lights = this.getAllLightNodes(this.scene);

    geometries
      .flatMap(({ polygons, globalTransform: nodeTransform }) => polygons.map(polygon => {
        polygon = polygon.applyTransform(nodeTransform);
        const d1 = polygon.v1.sub(this.transform.position).dot(this.transform.basis.forward);
        const d2 = polygon.v2.sub(this.transform.position).dot(this.transform.basis.forward);
        const d3 = polygon.v3.sub(this.transform.position).dot(this.transform.basis.forward);
        if (d1 < 0 && d2 < 0 && d3 < 0 ) return null;

        if (polygon.normal.dot(this.transform.basis.forward) >= 0.3) return null;

        return polygon.applyTransform(this.transform.inverse);
      }))
      .filter(Boolean)
      .sort((a, b) => {
        const az = Math.min(a.v1.z, a.v2.z, a.v3.z);
        const bz = Math.min(b.v1.z, b.v2.z, b.v3.z);

        return az - bz;
      })
      .forEach(polygon => {
        const p1 = this.toScreenSpace(polygon.v1);
        const p2 = this.toScreenSpace(polygon.v2);
        const p3 = this.toScreenSpace(polygon.v3);

        let color = polygon.color;

        color = this.processDirectionalLight(polygon, color);
        lights.forEach(light => {
          color = this.processPointLight(polygon, light, color);
        });
        
        this.renderPolygon(p1, p2, p3, color);

        // Draw the polygon's normal vector
        // this.drawLine(polygon.center, polygon.center.add(polygon.normal.mul(0.05)), Color.RED);
      });
  }

  renderPolygon(p1, p2, p3, color) {
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.lineTo(p3.x, p3.y);
    this.ctx.closePath();
    color.assign(this.ctx);
    this.ctx.fill();
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = 3;
    color.mul(0.7).assign(this.ctx);
    this.ctx.stroke();
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
