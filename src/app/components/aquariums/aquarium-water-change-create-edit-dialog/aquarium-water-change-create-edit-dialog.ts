import { Component, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WaterChangeService } from '../../../core/services/water-change/water-change.service';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { toast } from '@spartan-ng/brain/sonner';
import { MessageResponse } from '../../../core/models/message-response.model';
import { CreateEditWaterChangeDto } from '../../../core/models/water-changes.model';
import { displayApiError } from '../../../core/helpers/error-handler';
import { finalize } from 'rxjs';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { ErrorLabel } from '../../common/error-label/error-label';
import { SubmitButton } from '../../common/submit-button/submit-button';

@Component({
  selector: 'aquarium-water-change-create-edit-dialog',
  imports: [
    HlmDialogImports,
    HlmFieldImports,
    HlmInputImports,
    HlmButtonImports,
    HlmTooltipImports,
    ErrorLabel,
    ReactiveFormsModule,
    HlmSpinnerImports,
    SubmitButton,
  ],
  templateUrl: './aquarium-water-change-create-edit-dialog.html',
  styleUrl: './aquarium-water-change-create-edit-dialog.css',
})
export class AquariumWaterChangeCreateEditDialog {
  // Injects
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly waterChangeService = inject(WaterChangeService);

  // Inputs
  readonly aquariumId = input.required<string>();

  // Outputs
  readonly refreshList = output<void>();

  // State
  readonly waterChangeId = signal<string | null>(null);

  // Signals
  readonly dialog = viewChild.required(HlmDialog);
  protected readonly isLoadingData = signal(false);
  protected readonly isSubmitting = signal(false);

  constructor() {
    effect(() => {
      if (!this.waterChangeId()) {
        this.changeWaterForm.reset();
        this.changeWaterForm.markAsUntouched();
        return;
      }

      this.isLoadingData.set(true);
      this.waterChangeService
        .getWaterChangeForEdit(this.waterChangeId()!)
        .pipe(
          finalize(() => {
            this.isLoadingData.set(false);
          }),
        )
        .subscribe({
          next: (res) => {
            this.changeWaterForm.patchValue(res);
          },
          error: (err) => {
            displayApiError(err);
          },
        });
    });
  }

  protected readonly changeWaterForm = this.fb.group({
    changeDate: ['', Validators.required],
    amount: [null as number | null, Validators.required],
  });

  protected submitForm() {
    if (this.changeWaterForm.invalid) {
      this.changeWaterForm.markAllAsTouched();
      toast.warning('Proszę uzupełnić wszystkie wymagane pola.');
      return;
    }

    const formData = this.changeWaterForm.getRawValue();
    const waterChangeData: CreateEditWaterChangeDto = {
      changeDate: formData.changeDate,
      amount: formData.amount!,
    };

    this.isSubmitting.set(true);

    if (this.waterChangeId()) {
      this.editWaterChange(waterChangeData);
    } else {
      this.createWaterChange(waterChangeData);
    }

    this.isSubmitting.set(false);
  }

  private editWaterChange(waterChangeData: CreateEditWaterChangeDto): void {
    this.waterChangeService.updateWaterChange(this.waterChangeId()!, waterChangeData).subscribe({
      next: (res) => {
        this.processSuccess(res);
      },
      error: (err) => {
        displayApiError(err);
      },
    });
  }

  private createWaterChange(waterChangeData: CreateEditWaterChangeDto): void {
    this.waterChangeService.createWaterChange(this.aquariumId(), waterChangeData).subscribe({
      next: (res) => {
        this.processSuccess(res);
      },
      error: (err) => {
        displayApiError(err);
      },
    });
  }

  private processSuccess(res: MessageResponse): void {
    this.refreshList.emit();
    toast.success(res.message);
    this.dialog()?.close();
    this.changeWaterForm.reset();
    this.changeWaterForm.markAsUntouched();
  }

  openCreate() {
    this.open(null);
  }

  openEdit(waterChangeId: string) {
    this.open(waterChangeId);
  }

  private open(waterChangeId: string | null) {
    this.waterChangeId.set(waterChangeId);
    this.dialog().open();
  }
}
