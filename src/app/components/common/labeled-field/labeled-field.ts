import { Component, input } from '@angular/core';

@Component({
  selector: 'labeled-field',
  imports: [],
  templateUrl: './labeled-field.html',
  styleUrl: './labeled-field.css',
})
export class LabeledField {
  readonly label = input.required<string>();
  readonly value = input.required<string | number | undefined | null>();
  readonly unit = input<string | undefined>(undefined);

  readonly labelWeightClass = input<string>('font-medium');
  readonly labelColorClass = input<string>('text-black');
  readonly gapClass = input<string>('me-2');
}
