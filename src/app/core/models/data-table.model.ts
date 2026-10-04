/**
 * Definition of a single column in the DataTable.
 *
 * @template T - The type of records displayed in the table.
 *
 * @example
 * const columns: TableColumn<AquariumWaterChangeListItem>[] = [
 *   { key: 'changeDate', label: 'Data zmiany', sortable: true },
 *   { key: 'amount',     label: 'Ilość (l)',   sortable: true },
 * ];
 */
export interface TableColumn<T> {
  /** The key of the property in the record object. */
  key: keyof T & string;

  /** The display label shown in the column header. */
  label: string;

  /** When true the column header is clickable and triggers sorting. */
  sortable?: boolean;

  /** When true the column is not rendered in the DOM. */
  hidden?: boolean;

  /** When true is not visible in the list - can be changed in Column Visibility. */
  isVisible?: boolean;

  /** Optional custom cell renderer – a function that formats the raw value.
   *
   * @example
   * format: (value) => (value != null ? `${value} l` : '—'),
   *
   * @example
   * format: (value) => {
   *   if (!value) {
   *     return '—';
   *   }
   *   return this.datePipe.transform(value as string | Date, 'dd.MM.yyyy') || '—';
   * },
   */
  format?: (value: unknown, row: T) => string;
}
