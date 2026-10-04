import { Component, input } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

@Component({
  selector: 'submit-button',
  imports: [HlmButtonImports, HlmSpinnerImports],
  templateUrl: './submit-button.html',
  styleUrl: './submit-button.css',
})
export class SubmitButton {
  readonly buttonText = input.required<string>();
  readonly isSubmitting = input.required<boolean>();
  readonly isDisabled = input.required<boolean>();
  readonly variant = input<
    | 'link'
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'destructive'
    | 'info'
    | 'success'
    | null
    | undefined
  >();
  readonly buttonType = input<'submit' | 'reset' | 'button'>('submit');
  readonly click = input<void>();
}
