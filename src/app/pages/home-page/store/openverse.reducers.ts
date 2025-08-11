import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { Openverse } from '../models/openverse';
import { OpenverseActions } from './openverse.actions';

export interface OpenverseState extends EntityState<Openverse> {
  searchQuery: string;
  searchKeywords: string[];
  isLoading: boolean;
  error: any;
  resultCount: number;
  currentPage: number;
  pageSize: number;
  hasMoreResults: boolean;
}

export const openverseEntityAdapter: EntityAdapter<Openverse> =
  createEntityAdapter<Openverse>({
    selectId: (openverse) => openverse.id,
  });

const initialState: OpenverseState = openverseEntityAdapter.getInitialState({
  searchQuery: '',
  searchKeywords: [],
  isLoading: false,
  error: null,
  resultCount: 0,
  currentPage: 1,
  pageSize: 10,
  hasMoreResults: true,
});

export const openverseFeatureKey = 'openverse';

export const openverseReducer = createFeature({
  name: openverseFeatureKey,
  reducer: createReducer(
    initialState,

    on(OpenverseActions.addSearchQuery, (state, { query }) => ({
      ...openverseEntityAdapter.removeAll(state),
      searchQuery: query,
      isLoading: true,
      error: null,
      currentPage: 1,
    })),

    on(OpenverseActions.getOpenverseSuccess, (state, { response }) => ({
      ...openverseEntityAdapter.setAll(response.results, state),
      isLoading: false,
      resultCount: response.result_count,
      hasMoreResults: response.results.length < response.result_count,
    })),

    on(OpenverseActions.loadMoreOpenverseSuccess, (state, { response }) => ({
      ...openverseEntityAdapter.addMany(response.results, state),
      isLoading: false,
      hasMoreResults:
        state.currentPage * state.pageSize < response.result_count,
    })),

    on(OpenverseActions.getOpenverseError, (state, { error }) => ({
      ...state,
      isLoading: false,
      hasMoreResults: false,
      error,
    })),

    on(OpenverseActions.loadMoreOpenverse, (state) => ({
      ...state,
      isLoading: true,
      currentPage: state.currentPage + 1,
    })),

    on(OpenverseActions.addSearchKeywords, (state, { keywords }) => ({
      ...state,
      searchKeywords: Array.from(
        new Set([...state.searchKeywords, ...keywords]),
      ),
    })),
  ),
});
