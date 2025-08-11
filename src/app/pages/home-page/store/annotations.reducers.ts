import { createFeature, createReducer, on } from '@ngrx/store';
import { AnnotationsActions, PolygonDTO } from './annotations.actions';

export interface AnnotationsState {
  byId: Record<string, PolygonDTO[]>;
}

const initialState: AnnotationsState = {
  byId: {},
};

export const annotationsFeatureKey = 'annotations';

export const annotationsReducer = createFeature({
  name: annotationsFeatureKey,
  reducer: createReducer(
    initialState,
    on(AnnotationsActions.savePolygons, (state, { imageId, polygons }) => ({
      ...state,
      byId: {
        ...state.byId,
        [imageId]: polygons,
      },
    })),
    on(AnnotationsActions.clearPolygons, (state, { imageId }) => {
      const { [imageId]: _, ...rest } = state.byId;
      return {
        ...state,
        byId: rest,
      };
    }),
  ),
});
