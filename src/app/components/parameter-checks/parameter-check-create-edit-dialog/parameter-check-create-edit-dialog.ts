import { Component, effect, inject, output, resource, signal, viewChild } from '@angular/core';
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
import { ParametersCheckService } from '../../../core/services/parameters-check/parameters-check.service';
import { AquariumService } from '../../../core/services/aquarium/aquarium.service';
import { catchError, finalize, firstValueFrom, of, tap } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { SelectOption } from '../../../core/models/select.model';
import { toast } from '@spartan-ng/brain/sonner';
import { CreateEditParametersCheckDto } from '../../../core/models/parameters-check.model';
import { MessageResponse } from '../../../core/models/message-response.model';

@Component({
  selector: 'parameter-check-create-edit-dialog',
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
  templateUrl: './parameter-check-create-edit-dialog.html',
  styleUrl: './parameter-check-create-edit-dialog.css',
})
export class ParameterCheckCreateEditDialog {
  // Injects
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly parameterCheckService = inject(ParametersCheckService);
  private readonly aquariumService = inject(AquariumService);

  // Outputs
  readonly refreshList = output<void>();

  // States
  readonly parameterCheckId = signal<string | null>(null);

  // Signals
  readonly dialog = viewChild.required(HlmDialog);
  protected readonly isLoadingData = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly isLoadingAquariums = signal(false);
  protected readonly isOpen = signal(false);

  // Resources
  protected readonly aquariumsForSelectResource = resource({
    params: () => (this.isOpen() ? true : undefined),
    loader: () =>
      firstValueFrom(
        this.aquariumService.getAquariumsForSelect().pipe(
          tap(() => this.isLoadingAquariums.set(true)),
          catchError((err) => {
            displayApiError(err);
            return of([]);
          }),
          finalize(() => {
            this.isLoadingAquariums.set(false);
          }),
        ),
      ),
  });

  protected get aquariumsForSelect(): SelectOption[] {
    return this.aquariumsForSelectResource.value() ?? [];
  }

  constructor() {
    effect(() => {
      if (!this.parameterCheckId()) {
        this.parameterCheckForm.reset();
        this.parameterCheckForm.markAsUntouched();
        return;
      }

      this.isLoadingData.set(true);
      this.parameterCheckService
        .getForEdit(this.parameterCheckId()!)
        .pipe(
          finalize(() => {
            this.isLoadingData.set(false);
          }),
        )
        .subscribe({
          next: (res) => {
            this.parameterCheckForm.patchValue({
              aquariumId: res.aquariumId,
              measuredAt: res.measuredAt,
              measuredTime: res.measuredTime,
              pH: res.ph,
              kH: res.kh,
              gH: res.gh,
              nO3: res.no3,
              nO2: res.no2,
              nH3: res.nh3,
              pO4: res.po4,
              fE: res.fe,
              temperature: res.temperature,
            });
          },
          error: (err) => {
            displayApiError(err);
          },
        });
    });
  }
  protected readonly parameterCheckForm = this.fb.group({
    aquariumId: ['', Validators.required],
    measuredAt: ['', Validators.required],
    measuredTime: [null as string | null],
    temperature: [null as number | null, [Validators.min(0), Validators.max(100)]],
    pH: [null as number | null, [Validators.min(0), Validators.max(14)]],
    kH: [null as number | null, [Validators.min(0), Validators.max(30)]],
    gH: [null as number | null, [Validators.min(0), Validators.max(50)]],
    nO3: [null as number | null, [Validators.min(0), Validators.max(1000)]],
    nO2: [null as number | null, [Validators.min(0), Validators.max(100)]],
    nH3: [null as number | null, [Validators.min(0), Validators.max(20)]],
    pO4: [null as number | null, [Validators.min(0), Validators.max(10)]],
    fE: [null as number | null, [Validators.min(0), Validators.max(10)]],
  });

  protected aquariumIdSelection(aquariumId: string | null) {
    this.parameterCheckForm.controls.aquariumId.setValue(aquariumId ?? '');
    this.parameterCheckForm.controls.aquariumId.markAsTouched();
  }

  protected measuredAtSelection(measuredAt: Date | null | undefined) {
    this.parameterCheckForm.controls.measuredAt.setValue(
      measuredAt?.toISOString().split('.')[0] ?? new Date().toISOString().split('.')[0],
    );
    this.parameterCheckForm.controls.measuredAt.markAsTouched();
  }

  protected submitForm() {
    if (this.parameterCheckForm.invalid) {
      this.parameterCheckForm.markAllAsTouched();
      toast.warning('Proszę uzupełnić wszystkie wymagane pola.');
      return;
    }

    const formData = this.parameterCheckForm.getRawValue();

    const hasAny = [
      formData.pH,
      formData.kH,
      formData.gH,
      formData.nO3,
      formData.nO2,
      formData.nH3,
      formData.pO4,
      formData.fE,
      formData.temperature,
    ].some((v) => v);
    if (!hasAny) {
      toast.warning(
        'Podaj co najmniej jeden parametr (pH, kH, GH, NO3, NO2, NH3, PO4, FE lub temperaturę).',
      );
      return;
    }

    const parameterCheckData: CreateEditParametersCheckDto = {
      ph: formData.pH,
      gh: formData.gH,
      kh: formData.kH,
      no3: formData.nO3,
      no2: formData.nO2,
      nh3: formData.nH3,
      po4: formData.pO4,
      fe: formData.fE,
      temperature: formData.temperature,
      aquariumId: formData.aquariumId,
      measuredAt: formData.measuredAt,
      measuredTime: formData.measuredTime,
    };

    this.isSubmitting.set(true);

    if (this.parameterCheckId()) {
      this.editParameterCheck(parameterCheckData);
    } else {
      this.createParameterCheck(parameterCheckData);
    }
  }

  private editParameterCheck(parameterCheckData: CreateEditParametersCheckDto): void {
    this.parameterCheckService
      .update(this.parameterCheckId()!, parameterCheckData)
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

  private createParameterCheck(parameterCheckData: CreateEditParametersCheckDto): void {
    this.parameterCheckService
      .create(parameterCheckData)
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
    this.dialog().close();
    this.parameterCheckForm.reset();
    this.parameterCheckForm.markAsUntouched();
  }

  // Open - Create / Edit
  openCreate() {
    this.open(null);
  }

  openEdit(parameterCheckId: string) {
    this.open(parameterCheckId);
  }

  private open(parameterCheckId: string | null) {
    this.parameterCheckForm.reset();
    this.parameterCheckForm.markAsUntouched();

    this.parameterCheckId.set(null);
    this.parameterCheckId.set(parameterCheckId);
    this.isOpen.set(true);
    this.dialog().open();
  }
}
