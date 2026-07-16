import { Component, input } from '@angular/core';

@Component({
  selector: 'error-label',
  imports: [],
  templateUrl: './error-label.html',
  styleUrl: './error-label.css',
})
export class ErrorLabel {
  readonly message = input<string>('');
  readonly isDisabled = input<boolean>(true);
}
