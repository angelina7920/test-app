import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { OpenverseApi } from '../services/openverse-api';
import { OpenverseActions } from './openverse.actions';
import { OpenverseState } from './openverse.reducers';
import { OpenverseSelectors } from './openverse.selectors';
import { concatLatestFrom } from '@ngrx/operators';

@Injectable()
export class OpenverseEffects {
  private actions$ = inject(Actions);
  private openverseApi = inject(OpenverseApi);
  private store = inject(Store<OpenverseState>);

  searchOpenverse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OpenverseActions.getOpenverse, OpenverseActions.addSearchQuery),
      concatLatestFrom(() => [
        this.store.select(OpenverseSelectors.selectSearchQuery),
        this.store.select(OpenverseSelectors.selectCurrentPage),
        this.store.select(OpenverseSelectors.selectHasMoreResults),
      ]),
      switchMap(([_, searchQuery, currentPage]) => {
        return this.openverseApi.list(searchQuery, currentPage).pipe(
          mergeMap((response) => {
            const actions: Action[] = [
              OpenverseActions.getOpenverseSuccess({ response }),
            ];

            if (searchQuery && response.results.length > 0) {
              actions.push(
                OpenverseActions.addSearchKeywords({
                  keywords: this.getSearchKeywords(searchQuery),
                }),
              );
            }

            return actions;
          }),
          catchError((error) =>
            of(OpenverseActions.getOpenverseError({ error })),
          ),
        );
      }),
    ),
  );

  loadMoreOpenverse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OpenverseActions.loadMoreOpenverse),
      concatLatestFrom(() => [
        this.store.select(OpenverseSelectors.selectSearchQuery),
        this.store.select(OpenverseSelectors.selectCurrentPage),
      ]),
      switchMap(([, query, page]) =>
        this.openverseApi.list(query, page).pipe(
          map((response) =>
            OpenverseActions.loadMoreOpenverseSuccess({ response }),
          ),
          catchError((error) =>
            of(OpenverseActions.getOpenverseError({ error })),
          ),
        ),
      ),
    ),
  );

  private getSearchKeywords(search: string): string[] {
    return search
      .replace(/[^\w\s]/g, '')
      .toLowerCase()
      .split(/\s+/)
      .filter((item) => item.length > 1);
  }
}
