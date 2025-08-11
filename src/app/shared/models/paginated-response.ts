export interface PaginatedResponse<T> {
  result_count: number;
  page_count: number;
  page_size: number;
  page: number;
  results: T[];
}
