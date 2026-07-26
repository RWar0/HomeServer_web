import { Component, input, output, viewChild } from '@angular/core';
import { HlmAlertDialog, HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2 } from '@ng-icons/lucide';

@Component({
  selector: 'delete-confirm-dialog',
  imports: [HlmAlertDialogImports, HlmButtonImports, NgIcon],
  templateUrl: './delete-confirm-dialog.html',
  styleUrl: './delete-confirm-dialog.css',
  providers: [provideIcons({ lucideTrash2 })],
})
export class DeleteConfirmDialog {
  readonly dialog = viewChild.required(HlmAlertDialog);
  readonly onConfirm = output<void>();

  readonly elementName = input.required<string>();

  protected confirmDelete() {
    this.onConfirm.emit();
    this.dialog().close();
  }

  open() {
    this.dialog().open();
  }
}
