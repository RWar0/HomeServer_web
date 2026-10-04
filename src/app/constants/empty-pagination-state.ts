import { SortDirectionEnum } from '../core/enums/sort-direction.enum';
import { PageMetadata, PageResponse } from '../core/models/pagination.model';

export const emptyPaginationState: PageMetadata = {
  page: 1,
  pageSize: 10,
  sortBy: null,
  sortDirection: SortDirectionEnum.asc,
  totalCount: 0,
  totalPages: 1,
};

export const emptyPaginatedResponse = <T>(): PageResponse<T> => {
  return {
    data: [],
    pagination: emptyPaginationState,
  };
};
