import { Component, input, output, signal, viewChild } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmAlertDialog, HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'confirm-dialog',
  imports: [HlmAlertDialogImports, HlmButtonImports, HlmButtonImports, NgIcon],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  readonly dialog = viewChild.required(HlmAlertDialog);

  readonly onConfirm = output<void | string>();

  readonly variant = input<'success' | 'warning'>('success');

  readonly title = input.required<string>();
  readonly buttonText = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly icon = input.required<string>();

  readonly elementName = input.required<string>();
  protected readonly elementNameAddition = signal<string | null>(null);

  private readonly selectedId = signal<string | null>(null);

  protected confirmComplete() {
    if (this.selectedId()) {
      this.onConfirm.emit(this.selectedId()!);
    } else {
      this.onConfirm.emit();
    }
    this.dialog().close();
  }

  open() {
    this.selectedId.set(null);
    this.dialog().open();
  }

  openWithId(id: string) {
    this.selectedId.set(id);
    this.dialog().open();
  }

  openWithIdAndNameAddition(id: string, nameAddition: string) {
    this.selectedId.set(id);
    this.elementNameAddition.set(nameAddition);
    this.dialog().open();
  }
}
