import { Component, inject, resource, signal, viewChild } from '@angular/core';
import { VehicleFuelingService } from '../../../core/services/vehicle-fueling/vehicle-fueling.service';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { catchError, firstValueFrom, of } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { VehicleFuelingInfoItem } from '../../../core/models/vehicle-fueling.model';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { LabeledField } from '../../common/labeled-field/labeled-field';

@Component({
  selector: 'vehicle-fueling-info-dialog',
  imports: [
    HlmDialogImports,
    HlmSpinnerImports,
    HlmButtonImports,
    DatePipe,
    CurrencyPipe,
    LabeledField,
  ],
  templateUrl: './vehicle-fueling-info-dialog.html',
  styleUrl: './vehicle-fueling-info-dialog.css',
})
export class VehicleFuelingInfoDialog {
  // Injects
  private readonly vehicleFuelingService = inject(VehicleFuelingService);

  // States
  readonly dialog = viewChild.required(HlmDialog);
  readonly vehicleFuelingId = signal<string | undefined>(undefined);
  protected readonly isLoadingData = signal(false);

  // Resource
  protected readonly vehicleFuelingResource = resource({
    params: () => this.vehicleFuelingId(),
    loader: ({ params: vehicleFuelingId }) =>
      firstValueFrom(
        this.vehicleFuelingService.getById(vehicleFuelingId).pipe(
          catchError((err) => {
            displayApiError(err);
            return of();
          }),
        ),
      ),
  });

  protected get vehicleFueling(): VehicleFuelingInfoItem | undefined {
    return this.vehicleFuelingResource.value();
  }

  // Methods
  open(vehicleFuelingId: string) {
    this.vehicleFuelingId.set(undefined);
    this.vehicleFuelingId.set(vehicleFuelingId);
    this.dialog().open();
  }
}
