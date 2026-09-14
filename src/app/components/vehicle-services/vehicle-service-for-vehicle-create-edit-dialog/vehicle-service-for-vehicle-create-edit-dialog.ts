import { Component, effect, inject, input, output, signal, viewChild } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { ErrorLabel } from '../../common/error-label/error-label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { SubmitButton } from '../../common/submit-button/submit-button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmScrollAreaImports } from '@spartan-ng/helm/scroll-area';
import { lucideTrash2 } from '@ng-icons/lucide';
import { VehicleServicesService } from '../../../core/services/vehicle-service/vehicle-service.service';
import { CreateEditVehicleServiceItemDto } from '../../../core/models/vehicle-service-item.model';
import { finalize } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { toast } from '@spartan-ng/brain/sonner';
import { CreateEditVehicleServiceForVehicleDto } from '../../../core/models/vehicle-service.model';
import { MessageResponse } from '../../../core/models/message-response.model';

type VehicleServiceItemForm = FormGroup<{
  id: FormControl<string | null>;
  title: FormControl<string>;
  description: FormControl<string | null>;
  cost: FormControl<number | null>;
}>;

@Component({
  selector: 'vehicle-service-for-vehicle-create-edit-dialog',
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
    NgIcon,
    HlmScrollAreaImports,
  ],
  templateUrl: './vehicle-service-for-vehicle-create-edit-dialog.html',
  styleUrl: './vehicle-service-for-vehicle-create-edit-dialog.css',
  providers: provideIcons({ lucideTrash2 }),
})
export class VehicleServiceForVehicleCreateEditDialog {
  // Injectss
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly vehicleServicesService = inject(VehicleServicesService);

  // Outputs
  readonly refreshList = output<void>();

  // Inputs
  readonly vehicleId = input.required<string>();

  // Signals
  readonly serviceId = signal<string | null>(null);
  readonly dialog = viewChild.required(HlmDialog);
  readonly isLoadingData = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly isOpen = signal(false);

  protected readonly serviceForm = this.fb.group({
    title: ['', Validators.required],
    date: [null as Date | null, Validators.required],
    cost: [null as number | null, [Validators.min(0)]],
    mileage: [null as number | null, [Validators.min(0)]],
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

  constructor() {
    effect(() => {
      if (!this.serviceId()) {
        this.serviceForm.reset();
        this.serviceForm.markAsUntouched();
        return;
      }

      this.isLoadingData.set(true);
      this.vehicleServicesService
        .getForVehicleEdit(this.serviceId()!)
        .pipe(finalize(() => this.isLoadingData.set(false)))
        .subscribe({
          next: (res) => {
            this.serviceForm.patchValue({
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

    const serviceData: CreateEditVehicleServiceForVehicleDto = {
      title: formData.title,
      date: formData.date!,
      cost: formData.cost,
      mileage: formData.mileage,
      items: formData.items,
    };

    this.isSubmitting.set(true);
    if (this.serviceId()) {
      this.updateService(serviceData);
    } else {
      this.createService(serviceData);
    }
  }

  private updateService(data: CreateEditVehicleServiceForVehicleDto) {
    this.vehicleServicesService
      .updateWithoutVehicle(this.serviceId()!, data)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => this.processSuccess(res),
        error: (err) => displayApiError(err),
      });
  }

  private createService(data: CreateEditVehicleServiceForVehicleDto) {
    this.vehicleServicesService
      .createForVehicle(this.vehicleId()!, data)
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
