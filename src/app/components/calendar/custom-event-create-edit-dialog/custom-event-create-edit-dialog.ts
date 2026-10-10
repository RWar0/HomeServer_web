import { Component, computed, effect, inject, output, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { toast } from '@spartan-ng/brain/sonner';
import { CalendarService } from '../../../core/services/calendar/calendar.service';
import { SubmitButton } from '../../common/submit-button/submit-button';
import { CalendarEventCategory } from '../../../core/enums/calendar-event-category.enum';
import { CreateEditCalendarEvent } from '../../../core/models/calendar-event.model';
import { displayApiError } from '../../../core/helpers/error-handler';
import { finalize } from 'rxjs';
import { MessageResponse } from '../../../core/models/message-response.model';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { ErrorLabel } from '../../common/error-label/error-label';
import { SelectOption } from '../../../core/models/select.model';
import { translateEventCategory } from '../../../core/helpers/calendar-event-category-translator';
import { FormSelect } from '../../select/form-select/form-select';

@Component({
  selector: 'custom-event-create-edit-dialog',
  imports: [
    HlmDialogImports,
    HlmFieldImports,
    HlmInputImports,
    HlmButtonImports,
    HlmSelectImports,
    ReactiveFormsModule,
    SubmitButton,
    HlmSpinner,
    ErrorLabel,
    FormSelect,
  ],
  templateUrl: './custom-event-create-edit-dialog.html',
  styleUrl: './custom-event-create-edit-dialog.css',
})
export class CalendarEventDialog {
  // Injects
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly calendarService = inject(CalendarService);

  // Outputs
  readonly refreshList = output<void>();

  // States
  readonly dialog = viewChild.required(HlmDialog);
  readonly customEventId = signal<string | null>(null);
  protected readonly isLoadingData = signal(false);
  protected readonly isSubmitting = signal(false);

  protected readonly categoriesSelectOption = computed<SelectOption[]>(() => {
    return Object.values(CalendarEventCategory).map((category) => ({
      id: category,
      name: translateEventCategory(category),
    }));
  });

  constructor() {
    effect(() => {
      if (!this.customEventId()) {
        this.customEventForm.reset();
        this.customEventForm.markAsUntouched();
        return;
      }

      this.isLoadingData.set(true);
      this.calendarService
        .getCustomEventForEdit(this.customEventId()!)
        .pipe(
          finalize(() => {
            this.isLoadingData.set(false);
          }),
        )
        .subscribe({
          next: (res) => {
            this.customEventForm.patchValue(res);
          },
          error: (err) => {
            displayApiError(err);
          },
        });
    });
  }

  protected readonly customEventForm = this.fb.group({
    title: ['', Validators.required],
    category: [null as CalendarEventCategory | null, Validators.required],
    date: ['', Validators.required],
    time: [null as string | null],
    location: [null as string | null, Validators.maxLength(150)],
    description: [null as string | null, Validators.maxLength(1024)],
  });

  protected selectCategory(value: string | null) {
    this.customEventForm.controls.category.markAsTouched();
    if (!value || !(value in CalendarEventCategory)) {
      toast.warning('Wybrano niepoprawną kategorię!');
      return;
    }

    this.customEventForm.controls.category.setValue(value as CalendarEventCategory);
  }

  protected submitForm() {
    if (this.customEventForm.invalid) {
      this.customEventForm.markAllAsTouched();
      toast.warning('Proszę uzupełnić wszystkie wymagane pola.');
      return;
    }

    const formData = this.customEventForm.getRawValue();
    const customEvent: CreateEditCalendarEvent = {
      title: formData.title,
      category: formData.category!,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      description: formData.description,
    };

    this.isSubmitting.set(true);

    if (this.customEventId()) {
      this.editCustomEvent(customEvent);
    } else {
      this.createCustomEvent(customEvent);
    }
  }

  private editCustomEvent(customEvent: CreateEditCalendarEvent): void {
    this.calendarService
      .updateEvent(this.customEventId()!, customEvent)
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

  private createCustomEvent(customEvent: CreateEditCalendarEvent): void {
    this.calendarService
      .createEvent(customEvent)
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
    this.customEventForm.reset();
    this.customEventForm.markAsUntouched();
  }

  openCreate() {
    this.open(null);
  }

  openCreateWithDate(date: string) {
    this.open(null);
    this.customEventForm.controls.date.setValue(date);
    this.customEventForm.controls.date.markAsTouched();
  }

  openEdit(customEventId: string) {
    this.open(customEventId);
  }

  private open(customEventId: string | null) {
    this.customEventForm.reset();
    this.customEventForm.markAsUntouched();

    this.customEventId.set(null);
    this.customEventId.set(customEventId);
    this.dialog().open();
  }
}
