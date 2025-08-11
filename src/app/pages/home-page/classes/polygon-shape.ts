import { polygonCenter, pointInPolygon } from '../utils/geometry';
import { Point } from '../models/point';

export class PolygonShape {
  private basePoints: Point[];
  angle = 0;
  color = '231, 76, 60';
  constructor(points: Point[]) {
    this.basePoints = points.map((p) => ({ x: p.x, y: p.y }));
  }

  toDTO(): { basePoints: Point[]; angle: number; color: string } {
    return {
      basePoints: this.basePoints.map((p) => ({ x: p.x, y: p.y })),
      angle: this.angle,
      color: this.color,
    };
  }

  static fromDTO(dto: {
    basePoints: Point[];
    angle: number;
    color: string;
  }): PolygonShape {
    const poly = new PolygonShape(dto.basePoints);
    poly.angle = dto.angle;
    poly.color = dto.color;
    return poly;
  }

  get center(): Point {
    return polygonCenter(this.basePoints);
  }

  translate(dx: number, dy: number): void {
    this.basePoints = this.basePoints.map((p) => ({
      x: p.x + dx,
      y: p.y + dy,
    }));
  }

  transformedPoints(): Point[] {
    if (this.angle === 0) return this.basePoints.map((p) => ({ ...p }));
    const c = this.center;
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return this.basePoints.map((p) => {
      const dx = p.x - c.x;
      const dy = p.y - c.y;
      return { x: c.x + dx * cos - dy * sin, y: c.y + dx * sin + dy * cos };
    });
  }

  contains(pt: Point): boolean {
    return pointInPolygon(pt, this.transformedPoints());
  }

  rotationHandle(_ctx: CanvasRenderingContext2D): Point {
    const c = this.center;
    const offset = 40;
    const angle = this.angle - Math.PI / 2;
    return {
      x: c.x + Math.cos(angle) * offset,
      y: c.y + Math.sin(angle) * offset,
    };
  }

  draw(ctx: CanvasRenderingContext2D, withHandles = true): void {
    const pts = this.transformedPoints();
    if (pts.length < 2) return;
    ctx.save();
    ctx.lineWidth = 2;
    ctx.fillStyle = `rgba(${this.color}, 0.25)`;
    ctx.strokeStyle = `rgba(${this.color}, 1)`;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (withHandles) {
      const c = this.center;
      const h = this.rotationHandle(ctx);
      ctx.strokeStyle = 'rgba(33, 150, 243, 0.8)';
      ctx.fillStyle = 'rgba(33, 150, 243, 0.9)';
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(h.x, h.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(h.x, h.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
