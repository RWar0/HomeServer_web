import { Component, effect, inject, output, resource, signal, viewChild } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { ErrorLabel } from '../../common/error-label/error-label';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { SubmitButton } from '../../common/submit-button/submit-button';
import { FormSelect } from '../../select/form-select/form-select';
import { VehicleServicesService } from '../../../core/services/vehicle-service/vehicle-service.service';
import { VehicleService } from '../../../core/services/vehicles/vehicle.service';
import { catchError, finalize, firstValueFrom, of, tap } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { toast } from '@spartan-ng/brain/sonner';
import { CreateEditVehicleServiceDto } from '../../../core/models/vehicle-service.model';
import { MessageResponse } from '../../../core/models/message-response.model';
import { SelectOption } from '../../../core/models/select.model';
import { CreateEditVehicleServiceItemDto } from '../../../core/models/vehicle-service-item.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2 } from '@ng-icons/lucide';
import { HlmScrollAreaImports } from '@spartan-ng/helm/scroll-area';

type VehicleServiceItemForm = FormGroup<{
  id: FormControl<string | null>;
  title: FormControl<string>;
  description: FormControl<string | null>;
  cost: FormControl<number | null>;
}>;

@Component({
  selector: 'vehicle-service-create-edit-dialog',
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
    NgIcon,
    HlmScrollAreaImports,
  ],
  templateUrl: './vehicle-service-create-edit-dialog.html',
  styleUrl: './vehicle-service-create-edit-dialog.css',
  providers: provideIcons({ lucideTrash2 }),
})
export class VehicleServiceCreateEditDialog {
  // Injectss
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly vehicleServicesService = inject(VehicleServicesService);
  private readonly vehicleService = inject(VehicleService);

  // Outputs
  readonly refreshList = output<void>();

  // Signals
  readonly serviceId = signal<string | null>(null);
  readonly dialog = viewChild.required(HlmDialog);
  readonly isLoadingData = signal(false);
  protected readonly isLoadingVehicles = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly isOpen = signal(false);

  protected readonly serviceForm = this.fb.group({
    vehicleId: ['', Validators.required],
    title: ['', Validators.required],
    date: [null as Date | null, Validators.required],
    mileage: [null as number | null, [Validators.min(0)]],
    cost: [null as number | null, [Validators.min(0)]],
    items: this.fb.array<VehicleServiceItemForm>([]),
  });

  protected get itemsFormArray(): FormArray<VehicleServiceItemForm> {
    return this.serviceForm.controls.items;
  }

  private createItemForm(item?: CreateEditVehicleServiceItemDto): VehicleServiceItemForm {
    return this.fb.group({
      id: this.fb.control(item?.id ?? null),
      title: this.fb.control(item?.title ?? '', Validators.required),
      description: this.fb.control(item?.description ?? null),
      cost: this.fb.control(item?.cost ?? null, Validators.min(0)),
    });
  }

  protected addItem() {
    this.itemsFormArray.push(this.createItemForm());
  }

  protected removeItem(index: number) {
    this.itemsFormArray.removeAt(index);
    this.itemsFormArray.markAsUntouched();
  }

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
          finalize(() => this.isLoadingVehicles.set(false)),
        ),
      ),
  });

  protected get vehiclesForSelect(): SelectOption[] {
    return this.vehiclesForSelectResource.value() ?? [];
  }

  constructor() {
    effect(() => {
      if (!this.serviceId()) {
        this.serviceForm.reset();
        this.serviceForm.markAsUntouched();
        return;
      }

      this.isLoadingData.set(true);
      this.vehicleServicesService
        .getForEdit(this.serviceId()!)
        .pipe(finalize(() => this.isLoadingData.set(false)))
        .subscribe({
          next: (res) => {
            this.serviceForm.patchValue({
              vehicleId: res.vehicleId,
              title: res.title,
              date: res.date,
              mileage: res.mileage,
              cost: res.cost,
            });

            this.itemsFormArray.clear();

            for (const item of res.items) {
              this.itemsFormArray.push(this.createItemForm(item));
            }
          },
          error: (err) => displayApiError(err),
        });
    });
  }

  protected vehicleIdSelection(vehicleId: string | null) {
    this.serviceForm.controls.vehicleId.setValue(vehicleId ?? '');
    this.serviceForm.controls.vehicleId.markAsTouched();
  }

  protected submitForm() {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      toast.warning('Proszę uzupełnić wszystkie wymagane pola.');
      return;
    }

    const formData = this.serviceForm.getRawValue();

    if (!formData.date) {
      toast.warning('Data jest wymagana.');
      return;
    }

    const serviceData: CreateEditVehicleServiceDto = {
      vehicleId: formData.vehicleId,
      title: formData.title,
      date: formData.date!,
      mileage: formData.mileage,
      cost: formData.cost,
      items: formData.items,
    };

    this.isSubmitting.set(true);
    if (this.serviceId()) {
      this.updateService(serviceData);
    } else {
      this.createService(serviceData);
    }
  }

  private updateService(data: CreateEditVehicleServiceDto) {
    this.vehicleServicesService
      .update(this.serviceId()!, data)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => this.processSuccess(res),
        error: (err) => displayApiError(err),
      });
  }

  private createService(data: CreateEditVehicleServiceDto) {
    this.vehicleServicesService
      .create(data)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => this.processSuccess(res),
        error: (err) => displayApiError(err),
      });
  }

  private processSuccess(res: MessageResponse) {
    this.refreshList.emit();
    toast.success(res.message);
    this.dialog()?.close();
    this.serviceForm.reset();
  }

  openCreate() {
    this.open(null);
  }
  openEdit(id: string) {
    this.open(id);
  }

  private open(id: string | null) {
    this.serviceForm.reset();
    this.serviceForm.markAsUntouched();

    this.serviceId.set(null);
    this.serviceId.set(id);

    this.isOpen.set(true);
    this.dialog().open();
  }
}
