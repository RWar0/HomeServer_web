import { Injectable, signal } from '@angular/core';
import { PageMetadata } from '../models/pagination.model';

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

  setPageSize(pageSize: number) {
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
