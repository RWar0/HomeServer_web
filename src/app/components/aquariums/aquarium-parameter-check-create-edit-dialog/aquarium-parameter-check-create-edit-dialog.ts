import { Component, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { ParametersCheckService } from '../../../core/services/parameters-check/parameters-check.service';
import { finalize } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { MessageResponse } from '../../../core/models/message-response.model';
import { toast } from '@spartan-ng/brain/sonner';
import { CreateEditParametersCheckForAquariumDto } from '../../../core/models/parameters-check.model';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { ErrorLabel } from '../../common/error-label/error-label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { SubmitButton } from '../../common/submit-button/submit-button';

@Component({
  selector: 'aquarium-parameter-check-create-edit-dialog',
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
  ],
  templateUrl: './aquarium-parameter-check-create-edit-dialog.html',
  styleUrl: './aquarium-parameter-check-create-edit-dialog.css',
})
export class AquariumParameterCheckCreateEditDialog {
  // Injects
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly parameterCheckService = inject(ParametersCheckService);
  // Inputs
  readonly aquariumId = input.required<string>();

  // Outputs
  readonly refreshList = output<void>();

  // Signals
  readonly parameterCheckId = signal<string | null>(null);
  readonly dialog = viewChild.required(HlmDialog);
  protected readonly isLoadingData = signal(false);
  protected readonly isSubmitting = signal(false);

  protected readonly parameterCheckForm = this.fb.group({
    measuredAt: ['', Validators.required],
    temperature: [null as number | null, [Validators.min(0), Validators.max(100)]],
    pH: [null as number | null, [Validators.min(0), Validators.max(14)]],
    kH: [null as number | null, [Validators.min(0), Validators.max(30)]],
    gH: [null as number | null, [Validators.min(0), Validators.max(50)]],
    nO3: [null as number | null, [Validators.min(0), Validators.max(1000)]],
    nO2: [null as number | null, [Validators.min(0), Validators.max(100)]],
  });

  constructor() {
    effect(() => {
      const currentParameterCheckId = this.parameterCheckId();
      if (!currentParameterCheckId) {
        this.parameterCheckForm.reset();
        this.parameterCheckForm.markAsUntouched();
        return;
      }

      this.isLoadingData.set(true);
      this.parameterCheckService
        .getForEdit(currentParameterCheckId)
        .pipe(
          finalize(() => {
            this.isLoadingData.set(false);
          }),
        )
        .subscribe({
          next: (res) => {
            this.parameterCheckForm.patchValue({
              measuredAt: res.measuredAt,
              pH: res.ph,
              kH: res.kh,
              gH: res.gh,
              nO3: res.no3,
              nO2: res.no2,
              temperature: res.temperature,
            });
          },
          error: (err) => {
            displayApiError(err);
          },
        });
    });
  }

  // Methods
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
      formData.temperature,
    ].some((v) => v);
    if (!hasAny) {
      toast.warning('Podaj co najmniej jeden parametr (pH, kH, GH, NO3, NO2 lub temperaturę).');
      return;
    }

    const parameterCheckData: CreateEditParametersCheckForAquariumDto = {
      ph: formData.pH,
      gh: formData.gH,
      kh: formData.kH,
      no3: formData.nO3,
      no2: formData.nO2,
      temperature: formData.temperature,
      measuredAt: formData.measuredAt,
    };

    this.isSubmitting.set(true);

    if (this.parameterCheckId()) {
      this.editParameterCheck(parameterCheckData);
    } else {
      this.createParameterCheck(parameterCheckData);
    }
  }

  private editParameterCheck(parameterCheckData: CreateEditParametersCheckForAquariumDto): void {
    this.parameterCheckService
      .updateForAquarium(this.parameterCheckId()!, parameterCheckData)
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

  private createParameterCheck(parameterCheckData: CreateEditParametersCheckForAquariumDto): void {
    this.parameterCheckService
      .createForAquarium(this.aquariumId(), parameterCheckData)
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
    this.parameterCheckId.set(null);
  }

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
    this.dialog().open();
  }
}
