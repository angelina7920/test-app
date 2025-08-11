import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Openverse } from '../models/openverse';
import { PaginatedResponse } from '../../../shared/models/paginated-response';

@Injectable({
  providedIn: 'root',
})
export class OpenverseApi {
  private http = inject(HttpClient);

  list(
    search: string,
    page: number = 1,
    size: number = 10,
  ): Observable<PaginatedResponse<Openverse>> {
    const params = {
      q: search,
      page,
      page_size: size,
      aspect_ratio: 'wide',
      size: 'large',
    };

    return this.http.get<PaginatedResponse<Openverse>>(
      `/api/openverse/images`,
      {
        params,
      },
    );
  }
}
