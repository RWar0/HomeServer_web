import { Component, computed, input, output, signal } from '@angular/core';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { PageMetadata } from '../../../core/models/pagination.model';
import { HlmSelectImports } from '@spartan-ng/helm/select';

@Component({
  selector: 'pagination',
  imports: [HlmPaginationImports, HlmSelectImports],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  readonly paginationState = input.required<PageMetadata>();
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  protected readonly pageSizes = signal<number[]>([2, 10, 20, 50, 100]);

  protected readonly _pageSizesWithCurrent = computed(() =>
    this.pageSizes().includes(this.paginationState().pageSize)
      ? this.pageSizes()
      : [...this.pageSizes(), this.paginationState().pageSize].sort((a, b) => a - b),
  );

  protected readonly pagesToDisplay = computed<(number | 'ellipsis')[]>(() => {
    const { page, totalPages } = this.paginationState();

    // If totalPages < 7 display all
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];

    // If page is near the beginning
    if (page <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(totalPages);
    }
    // If page is near the end
    else if (page >= totalPages - 3) {
      pages.push(1);
      pages.push('ellipsis');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    }
    // If page is in the middle
    else {
      pages.push(1);
      pages.push('ellipsis');
      pages.push(page - 1);
      pages.push(page);
      pages.push(page + 1);
      pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  });

  changePage(page: number) {
    this.pageChange.emit(page);
  }

  changePageSize(pageSize: number) {
    this.pageSizeChange.emit(Number(pageSize));
  }

  previous() {
    this.changePage(this.paginationState().page - 1);
  }

  next() {
    this.changePage(this.paginationState().page + 1);
  }

  getShowPrevious() {
    return this.paginationState().page > 1;
  }

  getShowNext() {
    return this.paginationState().page < this.paginationState().totalPages;
  }
}
