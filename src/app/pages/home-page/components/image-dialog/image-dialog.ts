import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  viewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Openverse } from '../../models/openverse';

import { PolygonShape } from '../../classes/polygon-shape';
import { Store } from '@ngrx/store';
import {
  AnnotationsActions,
  PolygonDTO,
} from '../../store/annotations.actions';
import { AnnotationsSelectors } from '../../store/annotations.selectors';
import { Point } from '../../models/point';
import { CanvasDrawing } from '../../services/canvas-drawing';
import { POLYGON_MIN_DOTS } from '../../constants/polygon';
import {
  DRAW_CLOSE_RADIUS_CSS,
  ROTATE_HANDLE_HIT_RADIUS_CSS,
} from '../../constants/dialog';

@Component({
  selector: 'app-image-dialog',
  imports: [CommonModule],
  templateUrl: './image-dialog.html',
  styleUrl: './image-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ImageDialog implements OnDestroy {
  readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  readonly imageDialogData = inject<Openverse>(DIALOG_DATA);

  readonly isLoading = signal(true);

  private img: HTMLImageElement | null = null;

  private polygons: PolygonShape[] = [];
  private drawingPoints: Point[] = [];
  private activePolygon: PolygonShape | null = null;
  private mode: 'idle' | 'drawing' | 'drag' | 'rotate' = 'idle';
  private lastPointer: Point | null = null;
  private rotateStartAngle = 0;
  private polygonStartAngle = 0;

  private detachFns: Array<() => void> = [];

  private readonly store = inject(Store);
  private readonly dialogRef = inject(DialogRef<unknown>);

  private readonly canvasEl = computed(() => this.canvas()?.nativeElement);
  private readonly ctx = computed<CanvasRenderingContext2D | null>(
    () => this.canvasEl()?.getContext('2d') ?? null,
  );

  private readonly canvasService = inject(CanvasDrawing);

  constructor() {
    effect(() => {
      const item = this.imageDialogData;
      if (!item?.id) return;
      this.store
        .select(AnnotationsSelectors.selectPolygonsByImageId(item.id))
        .subscribe((dtos: PolygonDTO[]) => {
          if (Array.isArray(dtos) && dtos.length) {
            this.polygons = dtos.map((dto) => PolygonShape.fromDTO(dto));
            this.redraw();
          }
        });
    });

    effect(() => {
      const canvas = this.canvasEl();
      const item = this.imageDialogData;
      const ctx = this.ctx();
      if (!canvas || !ctx || !item?.url) return;

      this.isLoading.set(true);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        this.img = img;
        this.redraw();
        this.attachEvents();
        this.isLoading.set(false);
      };
      img.src = item.url;
    });
  }

  ngOnDestroy(): void {
    this.detachEvents();
  }

  save(): void {
    if (
      this.mode === 'drawing' &&
      this.drawingPoints.length >= POLYGON_MIN_DOTS
    ) {
      const poly = new PolygonShape(this.drawingPoints);
      this.polygons.push(poly);
      this.drawingPoints = [];
      this.mode = 'idle';
    }
    const item = this.imageDialogData;
    if (!item?.id) return;
    const payload: PolygonDTO[] = this.polygons.map((p) => p.toDTO());
    this.store.dispatch(
      AnnotationsActions.savePolygons({ imageId: item.id, polygons: payload }),
    );
    this.close();
  }

  clear(): void {
    const item = this.imageDialogData;
    if (!item?.id) return;
    this.store.dispatch(AnnotationsActions.clearPolygons({ imageId: item.id }));
    this.polygons = [];
    this.drawingPoints = [];
    this.mode = 'idle';
    this.activePolygon = null;
    this.lastPointer = null;
    this.redraw();
  }

  close(): void {
    this.dialogRef.close();
  }

  private attachEvents(): void {
    const canvas = this.canvasEl();
    if (!canvas) return;
    this.detachEvents();

    const onMouseDown = (e: MouseEvent) => this.handlePointerDown(e);
    const onMouseMove = (e: MouseEvent) => this.handlePointerMove(e);
    const onMouseUp = (e: MouseEvent) => this.handlePointerUp(e);
    const onResize = () => this.redraw();

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('resize', onResize);

    this.detachFns.push(() =>
      canvas.removeEventListener('mousedown', onMouseDown),
    );
    this.detachFns.push(() =>
      window.removeEventListener('mousemove', onMouseMove),
    );
    this.detachFns.push(() => window.removeEventListener('mouseup', onMouseUp));
    this.detachFns.push(() => window.removeEventListener('resize', onResize));
  }

  private detachEvents(): void {
    this.detachFns.forEach((fn) => fn());
    this.detachFns = [];
  }

  private cssRadiusToCanvas(rCss: number): number {
    const canvas = this.canvasEl();
    if (!canvas) return rCss;
    return this.canvasService.cssRadiusToCanvas(canvas, rCss);
  }

  private toCanvasPoint(e: MouseEvent): Point {
    const canvas = this.canvasEl();
    if (!canvas) return { x: 0, y: 0 };
    return this.canvasService.toCanvasPoint(canvas, e);
  }

  private setCursor(cursor: string) {
    const canvas = this.canvasEl();
    if (canvas) this.canvasService.setCursor(canvas, cursor);
  }

  private handlePointerDown(e: MouseEvent): void {
    const ctx = this.ctx();
    if (!ctx) return;
    const p = this.toCanvasPoint(e);

    if (this.mode === 'drawing') {
      const start = this.drawingPoints[0];
      const closeRadius = this.cssRadiusToCanvas(DRAW_CLOSE_RADIUS_CSS);
      if (this.canvasService.shouldCloseDrawing(start, p, closeRadius)) {
        if (this.drawingPoints.length >= POLYGON_MIN_DOTS) {
          const poly = new PolygonShape(this.drawingPoints);
          this.polygons.push(poly);
        }
        this.drawingPoints = [];
        this.mode = 'idle';
        this.redraw();
        return;
      }
      this.drawingPoints.push(p);
      this.redraw(p);
      return;
    }

    const hitR = this.cssRadiusToCanvas(ROTATE_HANDLE_HIT_RADIUS_CSS);
    const hitRotate = this.canvasService.hitTestRotate(
      this.polygons,
      p,
      ctx,
      hitR,
    );
    if (hitRotate) {
      this.activePolygon = hitRotate;
      const { rotateStartAngle, polygonStartAngle } =
        this.canvasService.computeRotateStart(hitRotate, p);
      this.rotateStartAngle = rotateStartAngle;
      this.polygonStartAngle = polygonStartAngle;
      this.mode = 'rotate';
      this.setCursor('grabbing');
      return;
    }

    const hitMove = this.canvasService.hitTestMove(this.polygons, p);
    if (hitMove) {
      this.activePolygon = hitMove;
      this.mode = 'drag';
      this.lastPointer = p;
      this.setCursor('grabbing');
      return;
    }

    this.mode = 'drawing';
    this.drawingPoints = [p];
    this.redraw(p);
    this.setCursor('crosshair');
  }

  private handlePointerMove(e: MouseEvent): void {
    const ctx = this.ctx();
    if (!ctx) return;
    const p = this.toCanvasPoint(e);

    if (this.mode === 'drag' && this.activePolygon && this.lastPointer) {
      this.canvasService.applyDrag(this.activePolygon, this.lastPointer, p);
      this.lastPointer = p;
      this.redraw();
      return;
    }

    if (this.mode === 'rotate' && this.activePolygon) {
      this.canvasService.applyRotate(
        this.activePolygon,
        p,
        this.rotateStartAngle,
        this.polygonStartAngle,
      );
      this.redraw();
      return;
    }

    if (this.mode === 'idle') {
      const hitR = this.cssRadiusToCanvas(ROTATE_HANDLE_HIT_RADIUS_CSS);
      const onHandle = !!this.canvasService.hitTestRotate(
        this.polygons,
        p,
        ctx,
        hitR,
      );
      if (onHandle) {
        this.setCursor('grab');
      } else if (this.canvasService.hitTestMove(this.polygons, p)) {
        this.setCursor('grab');
      } else {
        this.setCursor('default');
      }
    }

    if (this.mode === 'drawing') {
      this.redraw(p);
    }
  }

  private handlePointerUp(_e: MouseEvent): void {
    if (this.mode === 'drag' || this.mode === 'rotate') {
      this.mode = 'idle';
      this.activePolygon = null;
      this.lastPointer = null;
      this.setCursor('default');
    }
  }

  private redraw(previewPoint?: Point): void {
    const canvas = this.canvasEl();
    const ctx = this.ctx();
    if (!canvas || !ctx) return;
    this.canvasService.redraw(
      ctx,
      canvas,
      this.img,
      this.polygons,
      this.mode,
      this.drawingPoints,
      previewPoint,
    );
  }
}
