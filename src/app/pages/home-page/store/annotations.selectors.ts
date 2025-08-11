import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  annotationsFeatureKey,
  AnnotationsState,
} from './annotations.reducers';

const selectAnnotationsState = createFeatureSelector<AnnotationsState>(
  annotationsFeatureKey,
);

const selectPolygonsByImageId = (imageId: string) =>
  createSelector(selectAnnotationsState, (state) => state.byId[imageId] ?? []);

export const AnnotationsSelectors = {
  selectPolygonsByImageId,
};
