import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  openverseEntityAdapter,
  openverseFeatureKey,
  OpenverseState,
} from './openverse.reducers';

const selectOpenverseState =
  createFeatureSelector<OpenverseState>(openverseFeatureKey);

const { selectAll } = openverseEntityAdapter.getSelectors();

const selectAllOpenverseItems = createSelector(selectOpenverseState, selectAll);

const selectIsLoading = createSelector(
  selectOpenverseState,
  (state) => state.isLoading,
);

const selectSearchQuery = createSelector(
  selectOpenverseState,
  (state) => state.searchQuery,
);

const selectCurrentPage = createSelector(
  selectOpenverseState,
  (state) => state.currentPage,
);

const selectHasMoreResults = createSelector(
  selectOpenverseState,
  (state) => state.hasMoreResults,
);

const selectSearchKeywords = createSelector(
  selectOpenverseState,
  (state) => state.searchKeywords,
);

export const OpenverseSelectors = {
  selectAllOpenverseItems,
  selectIsLoading,
  selectSearchQuery,
  selectCurrentPage,
  selectHasMoreResults,
  selectSearchKeywords,
};
