import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, resource, signal, viewChild } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { LabeledField } from '../../common/labeled-field/labeled-field';
import { VehicleServicesService } from '../../../core/services/vehicle-service/vehicle-service.service';
import { catchError, firstValueFrom, of } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { VehicleServiceInfoItem } from '../../../core/models/vehicle-service.model';

@Component({
  selector: 'vehicle-service-info-dialog',
  imports: [
    HlmDialogImports,
    HlmSpinnerImports,
    HlmButtonImports,
    DatePipe,
    CurrencyPipe,
    LabeledField,
  ],
  templateUrl: './vehicle-service-info-dialog.html',
  styleUrl: './vehicle-service-info-dialog.css',
})
export class VehicleServiceInfoDialog {
  // Injects
  private readonly vehicleServicesService = inject(VehicleServicesService);

  // States
  readonly dialog = viewChild.required(HlmDialog);
  readonly vehicleServiceId = signal<string | undefined>(undefined);
  protected readonly isLoadingData = signal(false);

  // Resource
  protected readonly vehicleServiceResource = resource({
    params: () => this.vehicleServiceId(),
    loader: ({ params: vehicleServiceId }) =>
      firstValueFrom(
        this.vehicleServicesService.getById(vehicleServiceId).pipe(
          catchError((err) => {
            displayApiError(err);
            return of();
          }),
        ),
      ),
  });

  protected get vehicleService(): VehicleServiceInfoItem | undefined {
    return this.vehicleServiceResource.value();
  }

  // Methods
  open(vehicleServiceId: string) {
    this.vehicleServiceId.set(undefined);
    this.vehicleServiceId.set(vehicleServiceId);
    this.dialog().open();
  }
}
