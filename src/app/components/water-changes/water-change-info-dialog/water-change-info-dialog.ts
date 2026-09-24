import { Component, inject, resource, signal, viewChild } from '@angular/core';
import { WaterChangeService } from '../../../core/services/water-change/water-change.service';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { WaterChangeInfoItem } from '../../../core/models/water-changes.model';
import { DatePipe } from '@angular/common';
import { LabeledField } from '../../common/labeled-field/labeled-field';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'water-change-info-dialog',
  imports: [HlmDialogImports, HlmSpinnerImports, HlmButtonImports, DatePipe, LabeledField],
  templateUrl: './water-change-info-dialog.html',
  styleUrl: './water-change-info-dialog.css',
})
export class WaterChangeInfoDialog {
  // Injects
  private readonly waterChangeService = inject(WaterChangeService);

  // States
  readonly dialog = viewChild.required(HlmDialog);
  readonly waterChangeId = signal<string | undefined>(undefined);
  protected readonly isLoadingData = signal(false);

  // Resource
  protected readonly waterChangeResource = resource({
    params: () => this.waterChangeId(),
    loader: ({ params: waterChangeId }) =>
      firstValueFrom(
        this.waterChangeService.getById(waterChangeId).pipe(
          catchError((err) => {
            displayApiError(err);
            return of();
          }),
        ),
      ),
  });

  protected get waterChange(): WaterChangeInfoItem | undefined {
    return this.waterChangeResource.value();
  }

  // Methods
  open(waterChangeId: string) {
    this.waterChangeId.set(undefined);
    this.waterChangeId.set(waterChangeId);
    this.dialog().open();
  }
}
