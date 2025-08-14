import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { AnnotationsActions, PolygonDTO } from './annotations.actions';

export interface AnnotationsState extends EntityState<PolygonDTO> {
  byImageId: Record<string, string[]>;
}

export const annotationsEntityAdapter: EntityAdapter<PolygonDTO> =
  createEntityAdapter<PolygonDTO>({
    selectId: (polygon) => {
      const id = `${polygon.basePoints[0]?.x}-${polygon.basePoints[0]?.y}-${polygon.angle}-${polygon.color}`;
      return id;
    },
  });

const initialState: AnnotationsState = annotationsEntityAdapter.getInitialState({
  byImageId: {},
});

export const annotationsFeatureKey = 'annotations';

export const annotationsReducer = createFeature({
  name: annotationsFeatureKey,
  reducer: createReducer(
    initialState,
    on(AnnotationsActions.savePolygons, (state, { imageId, polygons }) => {
      const existingIds = state.byImageId[imageId] || [];
      const newState = existingIds.length > 0 
        ? annotationsEntityAdapter.removeMany(existingIds, state)
        : state;

      const newStateWithPolygons = annotationsEntityAdapter.addMany(polygons, newState);
      
      const newPolygonIds = polygons.map(polygon => 
        annotationsEntityAdapter.selectId(polygon) as string
      );

      return {
        ...newStateWithPolygons,
        byImageId: {
          ...newStateWithPolygons.byImageId,
          [imageId]: newPolygonIds,
        },
      };
    }),
    on(AnnotationsActions.clearPolygons, (state, { imageId }) => {
      const existingIds = state.byImageId[imageId] || [];
      if (existingIds.length === 0) return state;

      const { [imageId]: _, ...restByImageId } = state.byImageId;
      
      return {
        ...annotationsEntityAdapter.removeMany(existingIds, state),
        byImageId: restByImageId,
      };
    }),
  ),
});
