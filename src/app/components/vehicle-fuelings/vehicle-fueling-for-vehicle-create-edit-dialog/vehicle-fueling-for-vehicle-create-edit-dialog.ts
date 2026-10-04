import { Component, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { ErrorLabel } from '../../common/error-label/error-label';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { SubmitButton } from '../../common/submit-button/submit-button';
import { VehicleFuelingService } from '../../../core/services/vehicle-fueling/vehicle-fueling.service';
import { finalize } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { toast } from '@spartan-ng/brain/sonner';
import { CreateEditVehicleFuelingForVehicleDto } from '../../../core/models/vehicle-fueling.model';
import { MessageResponse } from '../../../core/models/message-response.model';

@Component({
  selector: 'vehicle-fueling-for-vehicle-create-edit-dialog',
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
  templateUrl: './vehicle-fueling-for-vehicle-create-edit-dialog.html',
  styleUrl: './vehicle-fueling-for-vehicle-create-edit-dialog.css',
})
export class VehicleFuelingForVehicleCreateEditDialog {
  // Injects
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly fuelingService = inject(VehicleFuelingService);

  // Inputs
  readonly vehicleId = input.required<string>();

  // Outputs
  readonly refreshList = output<void>();

  // Signals
  readonly fuelingId = signal<string | null>(null);
  readonly dialog = viewChild.required(HlmDialog);

  protected readonly isLoadingData = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly isOpen = signal(false);

  protected readonly fuelingForm = this.fb.group({
    date: [null as Date | null, Validators.required],
    quantity: [null as number | null, [Validators.required, Validators.min(0.1)]],
    cost: [null as number | null, [Validators.min(0)]],
  });

  constructor() {
    effect(() => {
      if (!this.fuelingId()) {
        this.fuelingForm.reset();
        this.fuelingForm.markAsUntouched();
        return;
      }

      this.isLoadingData.set(true);
      this.fuelingService
        .getForEditWithoutVehicle(this.fuelingId()!)
        .pipe(finalize(() => this.isLoadingData.set(false)))
        .subscribe({
          next: (res) =>
            this.fuelingForm.patchValue({
              cost: res.cost,
              date: res.date,
              quantity: res.quantity,
            }),
          error: (err) => {
            this.dialog().close();
            displayApiError(err);
          },
        });
    });
  }

  protected submitForm() {
    if (this.fuelingForm.invalid) {
      this.fuelingForm.markAllAsTouched();
      toast.warning('Proszę uzupełnić wszystkie wymagane pola.');
      return;
    }

    const formData = this.fuelingForm.getRawValue();
    const fuelingData: CreateEditVehicleFuelingForVehicleDto = {
      date: formData.date!,
      quantity: formData.quantity!,
      cost: formData.cost ?? undefined,
    };

    this.isSubmitting.set(true);

    if (this.fuelingId()) {
      this.editFueling(fuelingData);
    } else {
      this.createFueling(fuelingData);
    }
  }

  private editFueling(fuelingData: CreateEditVehicleFuelingForVehicleDto): void {
    if (!this.fuelingId()) {
      toast.error('Nie podano ID tankowania.');
      return;
    }

    this.fuelingService
      .updateForVehicle(this.fuelingId()!, fuelingData)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => this.processSuccess(res),
        error: (err) => displayApiError(err),
      });
  }

  private createFueling(fuelingData: CreateEditVehicleFuelingForVehicleDto): void {
    this.fuelingService
      .createForVehicle(this.vehicleId(), fuelingData)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => this.processSuccess(res),
        error: (err) => displayApiError(err),
      });
  }

  private processSuccess(res: MessageResponse): void {
    this.refreshList.emit();
    toast.success(res.message);
    this.dialog()?.close();
    this.fuelingForm.reset();
    this.fuelingForm.markAsUntouched();
  }

  openCreate() {
    this.open(null);
  }

  openEdit(id: string) {
    this.open(id);
  }

  private async open(fuelingId: string | null) {
    this.fuelingForm.reset();
    this.fuelingForm.markAsUntouched();

    this.fuelingId.set(null);
    this.fuelingId.set(fuelingId);

    this.isOpen.set(true);
    this.dialog().open();
  }
}
