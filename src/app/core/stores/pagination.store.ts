import { Injectable, signal } from '@angular/core';
import { PageMetadata } from '../models/pagination.model';
import { SortDirectionEnum } from '../enums/sort-direction.enum';

/**
 * Store for managing pagination and sort state.
 *
 * This store holds the current page number, page size, sort by column and sort direction, total number of pages, and total count of items.
 * It provides methods to update these values and reset them to their default state.
 *
 * @example
 * class MyComponent {
 *  protected readonly paginationStore = inject(PaginationStore);
 *
 * // Get current pagination state
 * const state = this.paginationStore.state; // { page: 1, pageSize: 20, totalPages: 0, totalCount: 0 }
 *
 * // Set a new page number
 * this.paginationStore.setPage(2);
 *
 * // Set a new page size
 * this.paginationStore.setPageSize(10);
 *
 * // Set pagination data from an API response
 * this.paginationStore.setPagination({
 *   page: 1,
 *   pageSize: 10,
 *   sortBy: null,
 *   sortDirection: SortDirectionEnum.asc,
 *   totalPages: 5,
 *   totalCount: 50
 * });
 *
 * // Reset to default values
 * this.paginationStore.reset(); // page: 1, pageSize: 20, sortBy: null, sortDirection: SortDirectionEnum.asc, totalPages: 0, totalCount: 0
 * }
 */
@Injectable()
export class PaginationStore {
  private readonly initialSortDirection = SortDirectionEnum.asc;

  readonly page = signal(1);
  readonly pageSize = signal(20);

  readonly sortBy = signal<string | null>(null);
  readonly sortDirection = signal<SortDirectionEnum>(this.initialSortDirection);

  readonly totalPages = signal(0);
  readonly totalCount = signal(0);

  get state(): PageMetadata {
    return {
      page: this.page(),
      pageSize: this.pageSize(),
      sortBy: this.sortBy(),
      sortDirection: this.sortDirection(),
      totalPages: this.totalPages(),
      totalCount: this.totalCount(),
    };
  }

  setPage(page: number) {
    this.page.set(page);
  }

  /**
   * Set page size and calculate new page number - change if needed.
   *
   * When changing the page size, the new page number is calculated based on the current first item index and the new page size.
   * This ensures that the first item on the new page is the same as the first item on the previous page.
   *
   * @param pageSize The new page size.
   *
   * @example
   * // Set page size to 10
   * this.paginationStore.setPageSize(10);
   */
  setPageSize(pageSize: number) {
    const firstItemIndex = (this.page() - 1) * this.pageSize() + 1;
    const newPage = Math.ceil(firstItemIndex / pageSize);
    this.page.set(newPage);
    this.pageSize.set(pageSize);
  }

  setSort(sortBy: string, sortDirection: SortDirectionEnum = SortDirectionEnum.asc) {
    this.sortBy.set(sortBy);
    this.sortDirection.set(sortDirection);
  }

  setSortBy(sortBy: string) {
    this.sortBy.set(sortBy);
  }

  setSortDirection(sortDirection: SortDirectionEnum) {
    this.sortDirection.set(sortDirection);
  }

  setPagination(pagination: PageMetadata) {
    this.totalPages.set(pagination.totalPages);
    this.totalCount.set(pagination.totalCount);
  }

  reset() {
    this.page.set(1);
    this.pageSize.set(20);
    this.sortBy.set(null);
    this.sortDirection.set(this.initialSortDirection);
  }
}
