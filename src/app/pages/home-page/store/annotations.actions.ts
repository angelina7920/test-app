import { createActionGroup, props } from '@ngrx/store';
import { Point } from '../models/point';

export interface PolygonDTO {
  basePoints: Point[];
  angle: number;
  color: string;
}

export const AnnotationsActions = createActionGroup({
  source: 'Annotations',
  events: {
    savePolygons: props<{ imageId: string; polygons: PolygonDTO[] }>(),
    clearPolygons: props<{ imageId: string }>(),
  },
});
