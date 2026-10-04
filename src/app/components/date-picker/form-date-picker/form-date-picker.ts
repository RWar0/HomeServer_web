import { Component, input, output } from '@angular/core';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { DateTime } from 'luxon';

@Component({
  selector: 'form-date-picker',
  imports: [HlmDatePickerImports, HlmFieldImports],
  templateUrl: './form-date-picker.html',
  styleUrl: './form-date-picker.css',
})
export class FormDatePicker {
  // inputs
  readonly placeholder = input<string | undefined>(undefined);
  readonly value = input.required<Date | null>();
  readonly inputId = input.required<string>();
  // outputs
  readonly onSelection = output<Date | undefined | null>();

  readonly maxDate = input<Date | undefined>(undefined);

  /**
   * Default focused date is today.
   *
   * @example
   * DateTime.now().toJSDate();
   *
   * @example
   * DateTime.now().minus({ years: 18 }).toJSDate();
   */
  public defaultFocusedDate = input<Date>(DateTime.now().toJSDate());

  /** Format dates as `dd.MM.yyyy` (e.g. `01.07.2026`). */
  protected formatDate = (date: Date): string => DateTime.fromJSDate(date).toFormat('dd MMM yyyy');
  protected formatInputDate = (date: Date): string =>
    DateTime.fromJSDate(date).toFormat('dd.MM.yyyy');

  /** Parse `dd.MM.yyyy` strings back into `Date` instances. */
  protected parseDate = (value: string): Date | null => {
    const dt = DateTime.fromFormat(value, 'dd.MM.yyyy');
    return dt.isValid ? dt.toJSDate() : null;
  };
}
