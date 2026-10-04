import { Component, input, output, signal, viewChild } from '@angular/core';
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
  readonly onConfirm = output<void | string>();

  readonly elementName = input.required<string>();

  protected readonly elementNameAddition = signal<string | null>(null);
  private readonly selectedId = signal<string | null>(null);

  protected confirmDelete() {
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

  openWithNameAddition(nameAddition: string) {
    this.elementNameAddition.set(nameAddition);
    this.dialog().open();
  }

  openWithIdAndNameAddition(id: string, nameAddition: string) {
    this.selectedId.set(id);
    this.elementNameAddition.set(nameAddition);
    this.dialog().open();
  }
}
