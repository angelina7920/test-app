import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  annotationsFeatureKey,
  AnnotationsState,
  annotationsEntityAdapter,
} from './annotations.reducers';

const selectAnnotationsState = createFeatureSelector<AnnotationsState>(
  annotationsFeatureKey,
);

const { selectAll, selectEntities } = annotationsEntityAdapter.getSelectors();

const selectAllPolygons = createSelector(selectAnnotationsState, selectAll);

const selectPolygonEntities = createSelector(selectAnnotationsState, selectEntities);

const selectPolygonsByImageId = (imageId: string) =>
  createSelector(
    selectAnnotationsState,
    (state) => {
      const polygonIds = state.byImageId[imageId] || [];
      return polygonIds
        .map(id => state.entities[id])
        .filter((polygon): polygon is NonNullable<typeof polygon> => polygon !== undefined);
    }
  );

const selectPolygonCountByImageId = (imageId: string) =>
  createSelector(
    selectAnnotationsState,
    (state) => state.byImageId[imageId]?.length || 0
  );

export const AnnotationsSelectors = {
  selectAllPolygons,
  selectPolygonEntities,
  selectPolygonsByImageId,
  selectPolygonCountByImageId,
};
