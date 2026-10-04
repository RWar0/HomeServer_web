import { SortDirectionEnum } from '../enums/sort-direction.enum';

export interface PageMetadata {
  page: number;
  pageSize: number;
  sortBy: string | null;
  sortDirection: SortDirectionEnum;
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
  sortBy: string | null;
  sortDirection: SortDirectionEnum;
}
