import { Component, inject, resource, signal, viewChild } from '@angular/core';
import { CustomEventService } from '../../../core/services/custom-event/custom-event.service';
import { HlmDialog } from '@spartan-ng/helm/dialog';
import { catchError, firstValueFrom, of } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { CustomEventItemDto } from '../../../core/models/calendar-event.model';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { DatePipe } from '@angular/common';
import { LabeledField } from '../../common/labeled-field/labeled-field';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { translateEventCategory } from '../../../core/helpers/calendar-event-category-translator';

@Component({
  selector: 'custom-event-info-dialog',
  imports: [HlmDialogImports, HlmSpinnerImports, HlmButtonImports, DatePipe, LabeledField],
  templateUrl: './custom-event-info-dialog.html',
  styleUrl: './custom-event-info-dialog.css',
})
export class CustomEventInfoDialog {
  // Injects
  private readonly customEventService = inject(CustomEventService);

  protected readonly translateEventCategory = translateEventCategory;

  // States
  readonly dialog = viewChild.required(HlmDialog);
  readonly customEventId = signal<string | undefined>(undefined);
  protected readonly isLoadingData = signal(false);

  // Resource
  protected readonly customEventResource = resource({
    params: () => this.customEventId(),
    loader: ({ params: customEventId }) =>
      firstValueFrom(
        this.customEventService.getById(customEventId).pipe(
          catchError((err) => {
            displayApiError(err);
            return of();
          }),
        ),
      ),
  });

  protected get customEvent(): CustomEventItemDto | undefined {
    return this.customEventResource.value();
  }

  // Methods
  open(customEventId: string) {
    this.customEventId.set(undefined);
    this.customEventId.set(customEventId);
    this.dialog().open();
  }
}
