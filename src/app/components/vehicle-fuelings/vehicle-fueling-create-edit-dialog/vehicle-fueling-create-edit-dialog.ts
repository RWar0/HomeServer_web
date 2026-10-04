import {
  Component,
  computed,
  effect,
  inject,
  output,
  resource,
  signal,
  viewChild,
} from '@angular/core';
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
import { VehicleFuelingService } from '../../../core/services/vehicle-fueling/vehicle-fueling.service';
import { VehicleService } from '../../../core/services/vehicles/vehicle.service';
import { catchError, finalize, firstValueFrom, of, tap } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { toast } from '@spartan-ng/brain/sonner';
import { CreateEditVehicleFuelingDto } from '../../../core/models/vehicle-fueling.model';
import { MessageResponse } from '../../../core/models/message-response.model';
import { SelectOption } from '../../../core/models/select.model';

@Component({
  selector: 'vehicle-fueling-create-edit-dialog',
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
  templateUrl: './vehicle-fueling-create-edit-dialog.html',
  styleUrl: './vehicle-fueling-create-edit-dialog.css',
})
export class VehicleFuelingCreateEditDialog {
  // Injects
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly fuelingService = inject(VehicleFuelingService);
  private readonly vehicleService = inject(VehicleService);

  // Outputs
  readonly refreshList = output<void>();

  // Signals
  readonly fuelingId = signal<string | null>(null);
  readonly dialog = viewChild.required(HlmDialog);

  protected readonly isLoadingData = signal(false);
  protected readonly isLoadingVehicles = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly isOpen = signal(false);
  protected readonly vehiclesOptions = signal<SelectOption[]>([]);

  protected readonly fuelingForm = this.fb.group({
    vehicleId: ['', Validators.required],
    date: [null as Date | null, Validators.required],
    quantity: [null as number | null, [Validators.required, Validators.min(0.1)]],
    cost: [null as number | null, [Validators.min(0)]],
  });

  protected readonly vehiclesForSelectResource = resource({
    params: () => (this.isOpen() ? true : undefined),
    loader: () =>
      firstValueFrom(
        this.vehicleService.getForSelect().pipe(
          tap(() => this.isLoadingVehicles.set(true)),
          catchError((err) => {
            displayApiError(err);
            return of([]);
          }),
          finalize(() => {
            this.isLoadingVehicles.set(false);
          }),
        ),
      ),
  });

  protected get vehiclesForSelect(): SelectOption[] {
    return this.vehiclesForSelectResource.value() ?? [];
  }

  constructor() {
    effect(() => {
      if (!this.fuelingId()) {
        this.fuelingForm.reset();
        this.fuelingForm.markAsUntouched();
        return;
      }

      this.isLoadingData.set(true);
      this.fuelingService
        .getForEdit(this.fuelingId()!)
        .pipe(finalize(() => this.isLoadingData.set(false)))
        .subscribe({
          next: (res) =>
            this.fuelingForm.patchValue({
              cost: res.cost,
              date: res.date,
              quantity: res.quantity,
              vehicleId: res.vehicleId,
            }),
          error: (err) => displayApiError(err),
        });
    });
  }

  protected vehicleIdSelection(vehicleId: string | null) {
    this.fuelingForm.controls.vehicleId.setValue(vehicleId ?? '');
    this.fuelingForm.controls.vehicleId.markAsTouched();
  }

  protected submitForm() {
    if (this.fuelingForm.invalid) {
      this.fuelingForm.markAllAsTouched();
      toast.warning('Proszę uzupełnić wszystkie wymagane pola.');
      return;
    }

    const formData = this.fuelingForm.getRawValue();
    const fuelingData: CreateEditVehicleFuelingDto = {
      vehicleId: formData.vehicleId,
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

  private editFueling(fuelingData: CreateEditVehicleFuelingDto): void {
    this.fuelingService
      .update(this.fuelingId()!, fuelingData)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => this.processSuccess(res),
        error: (err) => displayApiError(err),
      });
  }

  private createFueling(fuelingData: CreateEditVehicleFuelingDto): void {
    this.fuelingService
      .create(fuelingData)
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
