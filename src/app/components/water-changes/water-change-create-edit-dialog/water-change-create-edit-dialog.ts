import { Component, effect, inject, output, resource, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WaterChangeService } from '../../../core/services/water-change/water-change.service';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { catchError, finalize, firstValueFrom, of, tap } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { toast } from '@spartan-ng/brain/sonner';
import { CreateEditWaterChangeDto } from '../../../core/models/water-changes.model';
import { MessageResponse } from '../../../core/models/message-response.model';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { ErrorLabel } from '../../common/error-label/error-label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { SubmitButton } from '../../common/submit-button/submit-button';
import { AquariumService } from '../../../core/services/aquarium/aquarium.service';
import { SelectOption } from '../../../core/models/select.model';
import { FormSelect } from '../../select/form-select/form-select';

@Component({
  selector: 'water-change-create-edit-dialog',
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
    FormSelect,
  ],
  templateUrl: './water-change-create-edit-dialog.html',
  styleUrl: './water-change-create-edit-dialog.css',
})
export class WaterChangeCreateEditDialog {
  // Injects
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly waterChangeService = inject(WaterChangeService);
  private readonly aquariumService = inject(AquariumService);

  // Outputs
  readonly refreshList = output<void>();

  // States
  readonly waterChangeId = signal<string | null>(null);

  // Signals
  readonly dialog = viewChild.required(HlmDialog);
  protected readonly isLoadingData = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly isLoadingAquariums = signal(false);

  // Resources
  protected readonly aquariumsForSelectResource = resource({
    loader: () =>
      firstValueFrom(
        this.aquariumService.getAquariumsForSelect().pipe(
          tap(() => this.isLoadingAquariums.set(true)),
          catchError((err) => {
            displayApiError(err);
            return of([]);
          }),
          finalize(() => {
            this.isLoadingAquariums.set(false);
          }),
        ),
      ),
  });

  protected get aquariumsForSelect(): SelectOption[] {
    return this.aquariumsForSelectResource.value() ?? [];
  }

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
    aquariumId: ['', Validators.required],
  });

  protected aquariumIdSelection(aquariumId: string | null) {
    this.changeWaterForm.controls.aquariumId.setValue(aquariumId ?? '');
    this.changeWaterForm.controls.aquariumId.markAsTouched();
  }

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
      aquariumId: formData.aquariumId,
    };

    this.isSubmitting.set(true);

    if (this.waterChangeId()) {
      this.editWaterChange(waterChangeData);
    } else {
      this.createWaterChange(waterChangeData);
    }
  }

  private editWaterChange(waterChangeData: CreateEditWaterChangeDto): void {
    this.waterChangeService
      .updateWaterChange(this.waterChangeId()!, waterChangeData)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          this.processSuccess(res);
        },
        error: (err) => {
          displayApiError(err);
        },
      });
  }

  private createWaterChange(waterChangeData: CreateEditWaterChangeDto): void {
    this.waterChangeService
      .createWaterChange(waterChangeData)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
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
    this.changeWaterForm.reset();
    this.changeWaterForm.markAsUntouched();

    this.waterChangeId.set(null);
    this.waterChangeId.set(waterChangeId);
    this.dialog().open();
  }
}
