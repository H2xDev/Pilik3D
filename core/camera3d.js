import { 
  Color, 
  GeometryNode, 
  GNode3D, 
  PointLight, 
  DirectionalLight, 
  Polygon,
  Vec3,
  Fog,
  DEG_TO_RAD,
  AABB,
} from "./index.js";

export class Camera3D extends GNode3D {
  /** @type { Camera3D } */
  static current = null;

  fov = 50;
  far = 10;
  perspective = 1;

  /** @type { CanvasRenderingContext2D } */
  ctx = null;

  /** @type { GeometryNode[] } */
  geometryNodes = [];

  /** @type { PointLight[] } */
  lightNodes = [];

  constructor() {
    super();
    this.makeCurrent();
  }

  enterTree() {
    this.scene.on(Camera3D.Events.CHILD_ADDED, (node) => {
      this.geometryNodes = this.scene.getChildrenByClass(GeometryNode);
      this.lightNodes = this.scene.getChildrenByClass(PointLight);
    });
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

        const polygonIsTooFar = polygon.center.sub(this.position.add(this.basis.backward)).length > this.far;
        if (polygonIsTooFar) return null;

        // NOTE: Assuming the camera is a bit back from the original position
        const viewDir = polygon.center.sub(this.transform.position).normalized;

        const polygonFacingAway = polygon.normal.dot(viewDir) > 0;
        if (polygonFacingAway) return null;

        const dotRange = Math.cos(this.fov * DEG_TO_RAD);
        const viewV1 = polygon.v1.sub(this.position).normalized;
        const viewV2 = polygon.v2.sub(this.position).normalized;
        const viewV3 = polygon.v3.sub(this.position).normalized;
        const v1OutOfFrustum = viewV1.dot(this.basis.forward) < dotRange;
        const v2OutOfFrustum = viewV2.dot(this.basis.forward) < dotRange;
        const v3OutOfFrustum = viewV3.dot(this.basis.forward) < dotRange;

        const polygonIsOutOfFrustum = v1OutOfFrustum && v2OutOfFrustum && v3OutOfFrustum;
        if (polygonIsOutOfFrustum) return null;

        const resultPolygon = polygon.applyTransform(this.globalTransform.inverse);

        if (resultPolygon.geometryNode.polygonProgram) {
          return resultPolygon.geometryNode.polygonProgram(resultPolygon, this);
        }

        return resultPolygon;
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

        if (!polygon.geometryNode.emissive) {
          color = DirectionalLight.current?.processPolygon(this, polygon) || color;

          lights.forEach(light => {
            color = light.processPolygon(this, polygon, color);
          });
        }

        color = Fog.current.processPolygon(this, polygon, color);
        
        this.renderPolygon(polygon, color);

        // Draw the polygon's normal vector
        if (polygon.geometryNode.debug.showNormals) {
          this.drawLine(polygon.center, polygon.center.add(polygon.normal.mul(0.05)), Color.RED);
        }

        polugonsRendered++;
      });
  }

  /**
    * @param { number } dt - Delta time
    * @param { CanvasRenderingContext2D } ctx - The rendering context of the canvas
    */
  process(dt, ctx) {
    if (Camera3D.current !== this) return;

    this.ctx = ctx;
    this.perspective = (ctx.canvas.height / 2) / Math.tan(this.fov * DEG_TO_RAD / 2)

    const allGeometries = this.geometryNodes
      // NOTE: Skip geometries that are behind the camera
      .filter(geometry => geometry.enabled && geometry.aabb.vertices.some(v => v
        .applyTransform(geometry.globalTransform)
        .applyTransform(this.transform.inverse).z <= 0))

    const regularRender = allGeometries.filter(geometry => !geometry.passDepth);
    const backgroundRender = allGeometries.filter(geometry => geometry.passDepth);

    this.renderGeometries(backgroundRender, this.lightNodes);
    this.renderGeometries(regularRender, this.lightNodes);

    allGeometries
      .filter(geometry => geometry.debug.showAABB)
      .forEach(geometry => AABB.renderAABB(this, geometry, Color.ORANGE));
  }

  /**
    * @param { Polygon } polygon
    * @param { Color } color
    */
  renderPolygon(polygon, color) {
    if (polygon.geometryNode.preprocessPolygon) {
      polygon = polygon.geometryNode.preprocessPolygon(polygon, color, this);
    }

    const p1 = this.toScreenSpace(polygon.v1);
    const p2 = this.toScreenSpace(polygon.v2);
    const p3 = this.toScreenSpace(polygon.v3);

    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.lineTo(p3.x, p3.y);
    this.ctx.closePath();
    color.assign(this.ctx);
    this.ctx.fill();
    this.ctx.stroke();
  }


  /**
    * @param { Vec3 } v1
    * @param { Vec3 } v2
    * @param { Color } [color=Color.WHITE]
    * @param { boolean } [doTransform=false]
    */
  drawLine(v1, v2, color = Color.WHITE, doTransform = false) {
    if (!this.ctx) return;
    const p1 = this.toScreenSpace(v1, doTransform);
    const p2 = this.toScreenSpace(v2, doTransform);

    const oneOfPointsBehind = p1.z > 0 || p2.z > 0;
    if (oneOfPointsBehind) return;

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
    const p = this.toScreenSpace(center.applyTransform(this.transform.inverse));
    if (p.z > 0) return; // Skip circles that are behind the Camera3D
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, Math.max(0.001, 1.0 - radius / p.z), 0, Math.PI * 2);
    color.assign(this.ctx);
    this.ctx.fill();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = color.mul(0.7).toString();
    this.ctx.stroke();
  }

  /** 
    * @param { Vec3 } point 
    * @param { boolean } [doTransform=false] - Whether to apply the inverse transform of the Camera3D
    */
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
