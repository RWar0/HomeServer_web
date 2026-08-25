import { Component, computed, effect, inject, output, signal, viewChild } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { ErrorLabel } from '../../common/error-label/error-label';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { SubmitButton } from '../../common/submit-button/submit-button';
import { FormSelect } from '../../select/form-select/form-select';
import { VehicleService } from '../../../core/services/vehicles/vehicle.service';
import { finalize } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { toast } from '@spartan-ng/brain/sonner';
import { CreateEditVehicleDto } from '../../../core/models/vehicle.model';
import { MessageResponse } from '../../../core/models/message-response.model';
import { VehicleType } from '../../../core/enums/vehicle-type.enum';
import { SelectOption } from '../../../core/models/select.model';
import { translateVehicleType } from '../../../core/helpers/vehicle-type-translator';

@Component({
  selector: 'vehicle-create-edit-dialog',
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
  templateUrl: './vehicle-create-edit-dialog.html',
  styleUrl: './vehicle-create-edit-dialog.css',
})
export class VehicleCreateEditDialog {
  // Injects
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly vehicleService = inject(VehicleService);

  // Outputs
  readonly refreshList = output<void>();

  // States
  readonly vehicleId = signal<string | null>(null);

  // Signals
  readonly dialog = viewChild.required(HlmDialog);
  protected readonly isLoadingData = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly isOpen = signal(false);

  protected readonly vehicleTypesSelectOption = computed<SelectOption[]>(() => {
    return Object.values(VehicleType).map((type) => ({
      id: type,
      name: translateVehicleType(type),
    }));
  });

  constructor() {
    effect(() => {
      if (!this.vehicleId()) {
        this.vehicleForm.reset();
        this.vehicleForm.markAsUntouched();
        return;
      }

      this.isLoadingData.set(true);
      this.vehicleService
        .getForEdit(this.vehicleId()!)
        .pipe(
          finalize(() => {
            this.isLoadingData.set(false);
          }),
        )
        .subscribe({
          next: (res) => {
            this.vehicleForm.patchValue(res);
          },
          error: (err) => {
            displayApiError(err);
          },
        });
    });
  }

  protected readonly vehicleForm = this.fb.group({
    brand: ['', Validators.required],
    model: ['', Validators.required],
    production: [
      null as number | null,
      [Validators.required, Validators.min(1800), Validators.max(new Date().getFullYear() + 1)],
    ],
    type: [null as VehicleType | null, Validators.required],
  });

  protected selectVehicleType(value: string | null): void {
    if (!value || !(value in VehicleType)) {
      toast.warning('Wybrano niepoprawny typ pojazdu!');
      return;
    }

    this.vehicleForm.controls.type.setValue(value as VehicleType);
  }

  protected submitForm() {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      toast.warning('Proszę uzupełnić wszystkie wymagane pola.');
      return;
    }

    const formData = this.vehicleForm.getRawValue();

    if (!formData.type) {
      toast.error('Typ pojazdu jest wymagany.');
      return;
    }

    if (!(formData.type in VehicleType)) {
      toast.error('Wybrano niepoprawny typ pojazdu.');
      return;
    }

    const vehicleData: CreateEditVehicleDto = {
      brand: formData.brand,
      model: formData.model,
      production: formData.production!,
      type: formData.type!,
    };

    this.isSubmitting.set(true);

    if (this.vehicleId()) {
      this.editVehicle(vehicleData);
    } else {
      this.createVehicle(vehicleData);
    }
  }

  private editVehicle(vehicleData: CreateEditVehicleDto): void {
    this.vehicleService
      .update(this.vehicleId()!, vehicleData)
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

  private createVehicle(vehicleData: CreateEditVehicleDto): void {
    this.vehicleService
      .create(vehicleData)
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
    this.vehicleForm.reset();
    this.vehicleForm.markAsUntouched();
  }

  openCreate() {
    this.open(null);
  }

  openEdit(waterChangeId: string) {
    this.open(waterChangeId);
  }

  private open(vehicleId: string | null) {
    this.vehicleForm.reset();
    this.vehicleForm.markAsUntouched();

    this.vehicleId.set(null);
    this.vehicleId.set(vehicleId);
    this.isOpen.set(true);
    this.dialog().open();
  }
}
