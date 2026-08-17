import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  booleanAttribute,
  TemplateRef,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowDown,
  lucideArrowUp,
  lucideChevronsUpDown,
  lucideMoreHorizontal,
  lucideSettings2,
} from '@ng-icons/lucide';

import { HlmTableImports } from '@spartan-ng/helm/table';
import { PaginationStore } from '../../../core/stores/pagination.store';
import { SortDirectionEnum } from '../../../core/enums/sort-direction.enum';
import { TableColumn } from '../../../core/models/data-table.model';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmButton } from "@spartan-ng/helm/button";

@Component({
  selector: 'data-table',
  imports: [NgIcon, HlmTableImports, HlmCheckboxImports, HlmDropdownMenuImports, HlmButton],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
  providers: [
    provideIcons({
      lucideArrowUp,
      lucideArrowDown,
      lucideChevronsUpDown,
      lucideMoreHorizontal,
      lucideSettings2,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'w-full block',
  },
})
export class DataTable<T extends object> {
  // Inputs

  /** The rows to display. */
  readonly records = input.required<T[]>();

  /** Column definitions. */
  readonly columns = input.required<TableColumn<T>[]>();

  /** The PaginationStore instance provided by the parent component. */
  readonly paginationStore = input.required<PaginationStore>();

  /** Whether the table supports row selection. */
  readonly selectable = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });

  /** The key in the record used to uniquely identify it for selection. */
  readonly idKey = input<keyof T & string>('id' as any);

  /** The array of selected record IDs. */
  readonly selection = model<string[]>([]);

  /** Optional template for rendering a dropdown menu of actions per row. */
  readonly rowActions = input<TemplateRef<{ $implicit: T }>>();

  // Derived state

  protected readonly sortBy = computed(() => this.paginationStore().sortBy());

  protected readonly sortDirection = computed(() => this.paginationStore().sortDirection());

  /**
   * Stores columns manually hidden by the user.
   *
   * `hidden` from TableColumn is not stored here because it represents
   * a permanently hidden column.
   */
  private readonly userHiddenColumns = signal<Set<string>>(new Set());

  /**
   * Columns that can be controlled through Column Visibility.
   *
   * Permanently hidden columns are excluded.
   */
  protected readonly configurableColumns = computed(() =>
    this.columns().filter((column) => !column.hidden),
  );

  /**
   * Currently visible columns.
   *
   * `hidden` always takes precedence.
   * `isVisible` defines the initial visibility.
   * `userHiddenColumns` defines the current user selection.
   */
  protected readonly visibleColumns = computed(() => {
    const userHidden = this.userHiddenColumns();

    return this.columns().filter((column) => {
      if (column.hidden) {
        return false;
      }

      if (userHidden.has(column.key)) {
        return false;
      }

      return column.isVisible !== false;
    });
  });

  /**
   * Returns whether a configurable column is currently visible.
   */
  protected isColumnVisible(key: string): boolean {
    return this.visibleColumns().some((column) => column.key === key);
  }

  /**
   * Toggles visibility of a column.
   *
   * Permanently hidden columns cannot be changed.
   * At least one configurable column must remain visible.
   */
  protected toggleColumn(key: string): void {
    const column = this.columns().find((column) => column.key === key);

    if (!column || column.hidden) {
      return;
    }

    this.userHiddenColumns.update((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
        return next;
      }

      const visibleConfigurableColumns = this.configurableColumns().filter(
        (column) => !next.has(column.key) && column.isVisible !== false,
      );

      if (visibleConfigurableColumns.length <= 1) {
        return current;
      }

      next.add(key);

      return next;
    });
  }

  /**
   * Makes all configurable columns visible.
   */
  protected showAllColumns(): void {
    this.userHiddenColumns.set(new Set());
  }

  // Sorting
  protected readonly SortDirectionEnum = SortDirectionEnum;

  protected getSortIcon(key: string): string {
    if (this.sortBy() !== key) {
      return 'lucideChevronsUpDown';
    }

    return this.sortDirection() === SortDirectionEnum.asc ? 'lucideArrowUp' : 'lucideArrowDown';
  }

  protected isActiveSortColumn(key: string): boolean {
    return this.sortBy() === key;
  }

  protected onSortClick(key: string): void {
    const currentSortBy = this.sortBy();
    const currentDir = this.sortDirection();

    let nextDirection: SortDirectionEnum;

    if (currentSortBy !== key) {
      nextDirection = SortDirectionEnum.asc;
    } else {
      nextDirection =
        currentDir === SortDirectionEnum.asc ? SortDirectionEnum.desc : SortDirectionEnum.asc;
    }

    this.paginationStore().setSort(key, nextDirection);
    this.paginationStore().setPage(1);
  }

  // Cells
  protected getCellValue(row: T, col: TableColumn<T>): string {
    const raw = (row as Record<string, unknown>)[col.key];

    if (col.format) {
      return col.format(raw, row);
    }

    if (raw === null || raw === undefined) {
      return '—';
    }

    return String(raw);
  }

  // Selection
  protected isSelected(row: T): boolean {
    const id = String((row as Record<string, unknown>)[this.idKey()]);
    return this.selection().includes(id);
  }

  protected toggleSelection(row: T): void {
    const id = String((row as Record<string, unknown>)[this.idKey()]);

    this.selection.update((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }

  protected readonly isAllOnPageSelected = computed(() => {
    const records = this.records();
    const selection = this.selection();

    if (records.length === 0) {
      return false;
    }

    return records.every((row) => {
      const id = String((row as Record<string, unknown>)[this.idKey()]);
      return selection.includes(id);
    });
  });

  protected readonly isSomeOnPageSelected = computed(() => {
    const records = this.records();
    const selection = this.selection();

    if (records.length === 0) {
      return false;
    }

    let selectedCount = 0;

    for (const row of records) {
      const id = String((row as Record<string, unknown>)[this.idKey()]);

      if (selection.includes(id)) {
        selectedCount++;
      }
    }

    return selectedCount > 0 && selectedCount < records.length;
  });

  protected toggleAllOnPage(): void {
    const records = this.records();
    const allSelected = this.isAllOnPageSelected();

    if (allSelected) {
      const idsToRemove = records.map((row) =>
        String((row as Record<string, unknown>)[this.idKey()]),
      );

      this.selection.update((current) => current.filter((id) => !idsToRemove.includes(id)));
    } else {
      const idsToAdd = records.map((row) => String((row as Record<string, unknown>)[this.idKey()]));

      this.selection.update((current) => {
        const newSelection = [...current];

        for (const id of idsToAdd) {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        }

        return newSelection;
      });
    }
  }
}
