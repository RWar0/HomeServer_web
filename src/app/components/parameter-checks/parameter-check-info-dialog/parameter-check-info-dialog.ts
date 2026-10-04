import { DatePipe } from '@angular/common';
import { Component, inject, resource, signal, viewChild } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { LabeledField } from '../../common/labeled-field/labeled-field';
import { ParametersCheckService } from '../../../core/services/parameters-check/parameters-check.service';
import { catchError, firstValueFrom, of } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { ParametersCheckInfoItem } from '../../../core/models/parameters-check.model';

@Component({
  selector: 'parameter-check-info-dialog',
  imports: [HlmDialogImports, HlmSpinnerImports, HlmButtonImports, DatePipe, LabeledField],
  templateUrl: './parameter-check-info-dialog.html',
  styleUrl: './parameter-check-info-dialog.css',
})
export class ParameterCheckInfoDialog {
  // Injects
  private readonly parameterChecksService = inject(ParametersCheckService);

  // States
  readonly dialog = viewChild.required(HlmDialog);
  readonly parameterCheckId = signal<string | undefined>(undefined);
  protected readonly isLoadingData = signal(false);

  // Resource
  protected readonly parameterCheckResource = resource({
    params: () => this.parameterCheckId(),
    loader: ({ params: parameterCheckId }) =>
      firstValueFrom(
        this.parameterChecksService.getById(parameterCheckId).pipe(
          catchError((err) => {
            displayApiError(err);
            return of();
          }),
        ),
      ),
  });

  protected get parameterCheck(): ParametersCheckInfoItem | undefined {
    return this.parameterCheckResource.value();
  }

  // Methods
  open(parameterCheckId: string) {
    this.parameterCheckId.set(undefined);
    this.parameterCheckId.set(parameterCheckId);
    this.dialog().open();
  }
}
