import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  booleanAttribute,
  TemplateRef,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowDown,
  lucideArrowUp,
  lucideChevronsUpDown,
  lucideMoreHorizontal,
} from '@ng-icons/lucide';

import { HlmTableImports } from '@spartan-ng/helm/table';
import { PaginationStore } from '../../../core/stores/pagination.store';
import { SortDirectionEnum } from '../../../core/enums/sort-direction.enum';
import { TableColumn } from '../../../core/models/data-table.model';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';

@Component({
  selector: 'data-table',
  imports: [NgIcon, HlmTableImports, HlmCheckboxImports, HlmDropdownMenuImports],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
  providers: [
    provideIcons({ lucideArrowUp, lucideArrowDown, lucideChevronsUpDown, lucideMoreHorizontal }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'w-full block',
  },
})
/*
@input { T[] } records - The rows to display.
@input { TableColumn<T>[] } columns - Column definitions (label, key, sortable flag, optional formatter).
@input { PaginationStore } paginationStore - The PaginationStore instance provided by the parent component. Sort state is read from and written to this store.
@input { boolean } selectable - Whether the table supports row selection
@input { keyof T & string } idKey - The key in the record used to uniquely identify it for selection

@model { string[] } selection - The array of selected record IDs
*/
/**
 * Example usage:
 * ```html
 * <data-table
 *   [records]="users"
 *   [columns]="columns"
 *   [paginationStore]="paginationStore"
 *
 *   selectable
 *   [(selection)]="selectedIds" // this should be like: protected readonly selectedIds = signal<string[]>([]);
 *
 * />
 * ```
 * Example of actions column:
 * ```html
 * <data-table
 *   [records]="records"
 *   [columns]="columns"
 *   [paginationStore]="paginationStore"
 *   [rowActions]="actionsMenu"
 * />
 *
 * <ng-template #actionsMenu let-row>
 *   <div hlmDropdownMenu class="w-48">
 *     <button hlmDropdownMenuItem (click)="onEdit(row)">Edytuj</button>
 *     <button hlmDropdownMenuItem (click)="onDelete(row)" class="text-destructive">Usuń</button>
 *   </div>
 * </ng-template>
 * ```
 *
 * Example column definition:
 * ```typescript
 * const columns: TableColumn<User>[] = [
 *   {
 *     label: 'First Name',
 *     key: 'firstName',
 *     sortable: true,
 *   },
 *   {
 *     label: 'Last Name',
 *     key: 'lastName',
 *     sortable: true,
 *   },
 *   {
 *     label: 'Email',
 *     key: 'email',
 *     sortable: true,
 *   },
 *   {
 *     label: 'Age',
 *     key: 'age',
 *     sortable: true,
 *   },
 * ];
 * ```
 *
 *
 * Example column definition with custom formatter:
 * ```typescript
 * const columns: TableColumn<User>[] = [
 *   {
 *     label: 'First Name',
 *     key: 'firstName',
 *     sortable: true,
 *   },
 *   {
 *     label: 'Last Name',
 *     key: 'lastName',
 *     sortable: true,
 *   },
 *   {
 *     label: 'Email',
 *     key: 'email',
 *     sortable: true,
 *   },
 *   {
 *     label: 'Age',
 *     key: 'age',
 *     sortable: true,
 *     format: (value) => (value != null ? `${value} y` : '—'),
 *   },
 * ];
 * ```
 */
export class DataTable<T extends object> {
  // Inputs
  /** The rows to display. */
  readonly records = input.required<T[]>();

  /** Column definitions (label, key, sortable flag, optional formatter). */
  readonly columns = input.required<TableColumn<T>[]>();

  /**
   * The PaginationStore instance provided by the parent component.
   * Sort state is read from and written to this store.
   */
  readonly paginationStore = input.required<PaginationStore>();

  /** Whether the table supports row selection */
  readonly selectable = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** The key in the record used to uniquely identify it for selection */
  readonly idKey = input<keyof T & string>('id' as any);

  /** The array of selected record IDs */
  readonly selection = model<string[]>([]);

  /** Optional template for rendering a dropdown menu of actions per row */
  readonly rowActions = input<TemplateRef<{ $implicit: T }>>();

  //  Derived state
  protected readonly sortBy = computed(() => this.paginationStore().sortBy());
  protected readonly sortDirection = computed(() => this.paginationStore().sortDirection());

  //  Public helpers
  protected readonly SortDirectionEnum = SortDirectionEnum;

  /**
   * Returns the current sort icon name for a given column key.
   * – 'lucideChevronsUpDown'  → column is not the active sort column
   * – 'lucideArrowUp'         → column is sorted ASC
   * – 'lucideArrowDown'       → column is sorted DESC
   */
  protected getSortIcon(key: string): string {
    if (this.sortBy() !== key) {
      return 'lucideChevronsUpDown';
    }
    return this.sortDirection() === SortDirectionEnum.asc ? 'lucideArrowUp' : 'lucideArrowDown';
  }

  /**
   * Returns true when the given column is the currently active sort column.
   */
  protected isActiveSortColumn(key: string): boolean {
    return this.sortBy() === key;
  }

  /**
   * Handles a click on a sortable column header.
   *
   * Toggle logic:
   *  – If the column is not currently sorted → sort ASC
   *  – If the column is sorted ASC           → sort DESC
   *  – If the column is sorted DESC          → sort ASC (cycle back)
   */
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
    // Reset to first page when sorting changes
    this.paginationStore().setPage(1);
  }

  /**
   * Safely reads a cell value from a row and applies optional formatting.
   */
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

  // Selection helpers
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
    if (records.length === 0) return false;
    return records.every((row) => {
      const id = String((row as Record<string, unknown>)[this.idKey()]);
      return selection.includes(id);
    });
  });

  protected readonly isSomeOnPageSelected = computed(() => {
    const records = this.records();
    const selection = this.selection();
    if (records.length === 0) return false;
    let selectedCount = 0;
    for (const row of records) {
      const id = String((row as Record<string, unknown>)[this.idKey()]);
      if (selection.includes(id)) selectedCount++;
    }
    return selectedCount > 0 && selectedCount < records.length;
  });

  protected toggleAllOnPage(): void {
    const records = this.records();
    const allSelected = this.isAllOnPageSelected();

    if (allSelected) {
      // Deselect all on current page
      const idsToRemove = records.map((row) =>
        String((row as Record<string, unknown>)[this.idKey()]),
      );
      this.selection.update((current) => current.filter((id) => !idsToRemove.includes(id)));
    } else {
      // Select all on current page
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
