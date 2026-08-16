import { Component, input, output } from '@angular/core';
import { SelectOption } from '../../../core/models/select.model';
import { HlmComboboxImports } from '@spartan-ng/helm/combobox';

@Component({
  selector: 'form-select',
  imports: [HlmComboboxImports],
  templateUrl: './form-select.html',
  styleUrl: './form-select.css',
})
export class FormSelect {
  // inputs
  readonly items = input.required<SelectOption[]>();
  readonly isLoading = input.required<boolean>();
  readonly value = input.required<string | null>();
  readonly placeholder = input<string>('Wybierz...');
  readonly showClear = input<boolean>(true);

  // outputs
  readonly onSelection = output<string | null>();

  // Methods
  readonly itemToStringFn = (val: string | null | undefined): string => {
    if (!val) {
      return '';
    }
    const item = this.items().find((i) => i.id === val);
    return item ? item.name : '';
  };
}
