import { effect, inject, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

export interface SyncQueryParamOptions<T> {
  /** Method assigning value to query param */
  setter: (value: T) => void;

  /** Method converting query param from URL to TypeScript type.
   * Optional if T is a primitive type or can be parsed directly from string. */
  parser?: (value: string) => T;

  /** Default value for the query param. Applied if no value is present in URL or parsing fails. */
  defaultValue?: T;

  /** Method converting query param from TypeScript type to string. */
  formatter?: (value: T) => string | null | undefined;
}

/**
 * Per-field configuration for {@link syncQueryParams}.
 *
 * `setter`    – receives the raw URL string and should update the signal.
 * `formatter` – converts the current TypeScript value to a URL string.
 * `parser`    – converts the URL string to the TypeScript type (used for initial read).
 */
export interface SyncQueryParamsFieldConfig<T> {
  setter: (value: string) => void;
  formatter?: (value: T) => string | null | undefined;
  parser?: (value: string) => T;
  defaultValue?: T;
}

/**
 * Synchronizes multiple query parameters with a single `signal<Filters>` object.
 *
 * Each key in `config` corresponds to a query param name and a field in the signal.
 * On init: reads URL params and calls each field's `setter`.
 * On change: runs a single `effect` that writes all params back to the URL at once.
 *
 * @example
 * constructor() {
 *   syncQueryParams(this.filters, {
 *     aquariumId: {
 *       setter: (value) => this.setFilter('aquariumId', value),
 *     },
 *     fromDate: {
 *       setter: (value) => this.setFilter('fromDate', value ? new Date(value) : null),
 *       formatter: (filters) => filters.fromDate?.toISOString().split('T')[0],
 *     },
 *     toDate: {
 *       setter: (value) => this.setFilter('toDate', value ? new Date(value) : null),
 *       formatter: (filters) => filters.toDate?.toISOString().split('T')[0],
 *     },
 *   });
 * }
 */
export function syncQueryParams<TFilters extends object>(
  signal: Signal<TFilters>,
  config: {
    [K in keyof TFilters]?: SyncQueryParamsFieldConfig<TFilters[K]>;
  },
) {
  const route = inject(ActivatedRoute);
  const router = inject(Router);

  // Read initial values from URL and call each setter
  for (const key of Object.keys(config) as (keyof TFilters)[]) {
    const fieldConfig = config[key];
    if (!fieldConfig) continue;

    const initialValue = route.snapshot.queryParamMap.get(key as string);
    if (initialValue != null) {
      fieldConfig.setter(initialValue);
    }
  }

  // Single effect: sync signal -> URL for all fields at once
  effect(() => {
    const currentFilters = signal();
    const queryParams: Record<string, string | null> = {};

    for (const key of Object.keys(config) as (keyof TFilters)[]) {
      const fieldConfig = config[key];
      if (!fieldConfig) continue;

      const fieldValue = currentFilters[key];
      let urlValue: string | null;

      if (fieldConfig.formatter) {
        urlValue = fieldConfig.formatter(fieldValue) ?? null;
      } else {
        urlValue = fieldValue != null ? String(fieldValue) : null;
      }

      // If equals default – remove from URL
      if (fieldValue === fieldConfig.defaultValue) {
        urlValue = null;
      }

      queryParams[key as string] = urlValue;
    }

    router.navigate([], {
      relativeTo: route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });
}

/**
 * Generic method for synchronizing a query parameter with a signal.
 *
 * @param paramName Query param name (in URL - e.g. 'page', 'xyzFilter')
 * @param signal Observable signal to synchronize with query param.
 * @param options Sync configuration (setter, parser and default value)
 * @param formatter Optional method converting query param from TypeScript type to string.
 *
 *
 * @example
 * constructor() {
 *  syncQueryParam('xyzFilter', this.xyzFilterSignal, {
 *   setter: (value) => this.xyzFilterSignal.set(value),}
 *  }
 * }
 *
 * @example
 * constructor() {
 *  syncQueryParam('xyzFilter', this.xyzFilterSignal, {
 *    setter: (value) => this.xyzFilterSignal.set(value),
 *    parser: (value) => (value ? Number(value) : 0),
 *    defaultValue: 0,
 *  });
 * }
 *
 * @example
 * constructor() {
 *  syncQueryParam('xyzFilter', this.xyzFilterSignal, {
 *    setter: (value) => this.xyzFilterSignal.set(value),
 *    parser: (value) => (value ? Number(value) : 0),
 *    defaultValue: 0,
 *    formatter: (value) => value.toISOString(),
 *  });
 * }
 */
export function syncQueryParam<T>(
  paramName: string,
  value: Signal<T>,
  options: SyncQueryParamOptions<T>,
) {
  const route = inject(ActivatedRoute);
  const router = inject(Router);
  const { setter, defaultValue, parser } = options;

  // Read query param from URL (if exists) and assign to signal
  const initialValue = route.snapshot.queryParamMap.get(paramName);
  if (initialValue) {
    if (parser) {
      setter(parser(initialValue));
      return;
    }

    // If parser not provided - assume it's a primitive type or can be parsed directly from string
    setter(initialValue as unknown as T);
  }

  // Updating query param in URL when signal changes
  effect(() => {
    const currentValue = value();
    let queryValue: T | null = currentValue;

    if (options.formatter) {
      const formatted = options.formatter(currentValue);
      queryValue = formatted as T;
    }

    // If the new value is equal to default - remove
    queryValue = queryValue === defaultValue ? null : queryValue;
    router.navigate([], {
      relativeTo: route,
      queryParams: { [paramName]: queryValue },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });
}
