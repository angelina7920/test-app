import { HttpErrorResponse } from '@angular/common/http';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Openverse } from '../models/openverse';
import { PaginatedResponse } from '../../../shared/models/paginated-response';

export const OpenverseActions = createActionGroup({
  source: 'Openverse',
  events: {
    getOpenverse: emptyProps(),
    getOpenverseSuccess: props<{ response: PaginatedResponse<Openverse> }>(),
    getOpenverseError: props<{ error: HttpErrorResponse }>(),

    loadMoreOpenverse: emptyProps(),
    loadMoreOpenverseSuccess: props<{
      response: PaginatedResponse<Openverse>;
    }>(),

    addSearchQuery: props<{ query: string }>(),
    addSearchKeywords: props<{ keywords: string[] }>(),
  },
});
