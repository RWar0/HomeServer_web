import { effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginationStore } from '../stores/pagination.store';

/**
 * Injection function that synchronizes PaginationStore state with URL query params.
 *
 * - On init: reads `page` and `pageSize` from the current URL and applies them to the store.
 * - Reactively: whenever `page` or `pageSize` changes in the store, updates the URL query params.
 *   Default values (page=1, pageSize=20) are omitted from the URL to keep it clean.
 *
 * Must be called in an injection context (e.g. inside a constructor or inline field initializer).
 *
 * @example
 * constructor() {
 *   syncPaginationQueryParams();
 * }
 */
export function syncPaginationQueryParams() {
  const route = inject(ActivatedRoute);
  const router = inject(Router);
  const paginationStore = inject(PaginationStore);

  // Read initial values from URL query params
  const queryParams = route.snapshot.queryParamMap;
  const page = Number(queryParams.get('page'));
  const pageSize = Number(queryParams.get('pageSize'));
  if (page > 0) {
    paginationStore.setPage(page);
  }
  if (pageSize > 0) {
    paginationStore.setPageSize(pageSize);
  }

  // Keep URL in sync with store state
  effect(() => {
    const state = paginationStore.state;
    router.navigate([], {
      relativeTo: route,
      queryParams: {
        page: state.page !== 1 ? state.page : undefined,
        pageSize: state.pageSize !== 20 ? state.pageSize : undefined,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });
}
