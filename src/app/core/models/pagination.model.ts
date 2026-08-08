export interface PageMetadata {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PageResponse<T> {
  data: T[];
  pagination: PageMetadata;
}

export interface PageRequest {
  page: number;
  pageSize: number;
}
