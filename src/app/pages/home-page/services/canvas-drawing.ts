import { Injectable } from '@angular/core';
import { Point } from '../models/point';
import { PolygonShape } from '../classes/polygon-shape';
import { distance } from '../utils/geometry';
import { POLYGON_MIN_DOTS } from '../constants/polygon';
import {
  CANVAS_DRAW_FILL_COLOR,
  CANVAS_DRAW_START_POINT_COLOR,
  CANVAS_DRAW_STROKE_COLOR,
  CanvasDrawColors,
} from '../constants/canvas';

export type CanvasMode = 'idle' | 'drawing' | 'drag' | 'rotate';

@Injectable({ providedIn: 'root' })
export class CanvasDrawing {
  canvasScale(canvas: HTMLCanvasElement): { sx: number; sy: number } {
    const rect = canvas.getBoundingClientRect();
    return { sx: canvas.width / rect.width, sy: canvas.height / rect.height };
  }

  cssRadiusToCanvas(canvas: HTMLCanvasElement, rCss: number): number {
    const { sx, sy } = this.canvasScale(canvas);
    return (rCss * (sx + sy)) / 2;
  }

  toCanvasPoint(canvas: HTMLCanvasElement, e: MouseEvent): Point {
    const rect = canvas.getBoundingClientRect();
    const { sx, sy } = this.canvasScale(canvas);
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  }

  setCursor(canvas: HTMLCanvasElement, cursor: string): void {
    canvas.style.cursor = cursor;
  }

  hitTestRotate(
    polygons: PolygonShape[],
    p: Point,
    ctx: CanvasRenderingContext2D,
    hitRadius: number,
  ): PolygonShape | null {
    return (
      polygons.find(
        (poly) => distance(p, poly.rotationHandle(ctx)) <= hitRadius,
      ) || null
    );
  }

  hitTestMove(polygons: PolygonShape[], p: Point): PolygonShape | null {
    for (let i = polygons.length - 1; i >= 0; i--) {
      if (polygons[i].contains(p)) return polygons[i];
    }
    return null;
  }

  shouldCloseDrawing(
    start: Point | undefined,
    p: Point,
    closeRadius: number,
  ): boolean {
    return !!start && distance(p, start) < closeRadius;
  }

  computeRotateStart(
    poly: PolygonShape,
    p: Point,
  ): { rotateStartAngle: number; polygonStartAngle: number } {
    const c = poly.center;
    return {
      rotateStartAngle: Math.atan2(p.y - c.y, p.x - c.x),
      polygonStartAngle: poly.angle,
    };
  }

  applyRotate(
    poly: PolygonShape,
    p: Point,
    rotateStartAngle: number,
    polygonStartAngle: number,
  ): void {
    const c = poly.center;
    const currentAngle = Math.atan2(p.y - c.y, p.x - c.x);
    poly.angle = polygonStartAngle + (currentAngle - rotateStartAngle);
  }

  applyDrag(
    poly: PolygonShape,
    from: Point,
    to: Point,
  ): { dx: number; dy: number } {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    poly.translate(dx, dy);
    return { dx, dy };
  }

  redraw(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    img: HTMLImageElement | null,
    polygons: PolygonShape[],
    mode: CanvasMode,
    drawingPoints: Point[],
    previewPoint?: Point,
    colors?: Partial<CanvasDrawColors>,
  ): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (img) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    for (const poly of polygons) {
      poly.draw(ctx, true);
    }

    if (mode === 'drawing' && drawingPoints.length) {
      ctx.save();
      ctx.lineWidth = 2;
      const stroke = colors?.stroke ?? CANVAS_DRAW_STROKE_COLOR;
      const fill = colors?.fill ?? CANVAS_DRAW_FILL_COLOR;
      const startPoint = colors?.startPoint ?? CANVAS_DRAW_START_POINT_COLOR;
      ctx.strokeStyle = stroke;
      ctx.fillStyle = fill;

      const pts = [...drawingPoints];
      if (previewPoint) pts.push(previewPoint);

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      if (!previewPoint && pts.length >= POLYGON_MIN_DOTS) ctx.closePath();
      if (!previewPoint && pts.length >= POLYGON_MIN_DOTS) ctx.fill();
      ctx.stroke();

      const start = drawingPoints[0];
      ctx.fillStyle = startPoint;
      ctx.beginPath();
      ctx.arc(start.x, start.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
