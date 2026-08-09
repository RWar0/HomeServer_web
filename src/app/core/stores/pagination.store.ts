import { Injectable, signal } from '@angular/core';
import { PageMetadata } from '../models/pagination.model';

/**
 * Store for managing pagination state.
 *
 * This store holds the current page number, page size, total number of pages, and total count of items.
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
 *   totalPages: 5,
 *   totalCount: 50
 * });
 *
 * // Reset to default values
 * this.paginationStore.reset(); // page: 1, pageSize: 20, totalPages: 0, totalCount: 0
 * }
 */
@Injectable()
export class PaginationStore {
  readonly page = signal(1);
  readonly pageSize = signal(20);

  readonly totalPages = signal(0);
  readonly totalCount = signal(0);

  get state(): PageMetadata {
    return {
      page: this.page(),
      pageSize: this.pageSize(),
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

  setPagination(pagination: PageMetadata) {
    this.totalPages.set(pagination.totalPages);
    this.totalCount.set(pagination.totalCount);
  }

  reset() {
    this.page.set(1);
    this.pageSize.set(20);
  }
}
