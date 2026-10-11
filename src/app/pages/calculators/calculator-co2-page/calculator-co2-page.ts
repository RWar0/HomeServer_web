import { Component, computed, effect, inject, signal, WritableSignal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideStar, lucideTrash } from '@ng-icons/lucide';
import { toast } from '@spartan-ng/brain/sonner';
import { CalculatorsService } from '../../../core/services/calculators/calculators.service';
import { CalculateCO2Request, CalculateCO2Response } from '../../../core/models/calculators.model';
import { displayApiError } from '../../../core/helpers/error-handler';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { SubmitButton } from '../../../components/common/submit-button/submit-button';
import { ErrorLabel } from '../../../components/common/error-label/error-label';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-calculator-co2-page',
  imports: [
    HlmInputImports,
    HlmFieldImports,
    HlmButtonImports,
    NgIcon,
    ReactiveFormsModule,
    SubmitButton,
    ErrorLabel,
  ],
  templateUrl: './calculator-co2-page.html',
  styleUrl: './calculator-co2-page.css',
  providers: [provideIcons({ lucideStar, lucideTrash })],
})
export class CalculatorCo2Page {
  // Injects
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly calculatorsService = inject(CalculatorsService);

  protected readonly rangesWithMessages: [
    min: number,
    max: number | null,
    message: string,
    textColor: string,
    bgColor: string,
    isOptimal: boolean,
  ][] = [
    [0, 5, 'Zbyt niski poziom', 'red-500', 'red-50', false],
    [6, 10, 'Niski poziom', 'yellow-500', 'yellow-50', false],
    [10, 20, 'Dobry poziom', 'green-500', 'green-50', false],
    [20, 30, 'Optymalny poziom', 'emerald-600', 'emerald-50', true],
    [30, 35, 'Wysoki poziom', 'yellow-500', 'yellow-50', false],
    [35, null, 'Ryzykowny poziom', 'red-500', 'red-50', false],
  ];

  protected rangesList = this.rangesWithMessages.map(
    ([min, max, message, textColor, bgColor, isOptimal]) => {
      return {
        min,
        max,
        message,
        textColor,
        bgColor,
        isOptimal,
      };
    },
  );

  // Signals
  protected readonly isSubmitting = signal(false);
  protected readonly calculatorResult: WritableSignal<CalculateCO2Response | null> = signal(null);
  protected readonly calculatedResultBadge = computed(() => {
    const result = this.calculatorResult();
    if (!result) {
      return null;
    }
    const res = this.rangesList.find(
      (r) => r.min <= result.co2 && (r.max ?? Infinity) >= result.co2,
    );

    if (!res) {
      return null;
    }

    return res;
  });

  constructor() {
    effect(() => {
      const phParam = this.route.snapshot.queryParamMap.get('ph');
      const khParam = this.route.snapshot.queryParamMap.get('kh');

      if (phParam && khParam) {
        this.calculatorForm.patchValue({
          ph: parseFloat(phParam),
          kh: parseFloat(khParam),
        });

        this.submitForm();
        this.router.navigate([], {
          queryParams: { ph: null, kh: null },
          queryParamsHandling: 'merge',
        });
      }
    });
  }

  protected readonly calculatorForm = this.fb.group({
    kh: [null as number | null, Validators.required],
    ph: [null as number | null, Validators.required],
  });

  protected submitForm() {
    if (this.calculatorForm.invalid) {
      this.calculatorForm.markAllAsTouched();
      toast.warning('Proszę uzupełnić wszystkie wymagane pola.');
      return;
    }

    const request: CalculateCO2Request = {
      kh: this.calculatorForm.value.kh!,
      ph: this.calculatorForm.value.ph!,
    };

    this.isSubmitting.set(true);
    this.calculatorsService.calculateCO2(request).subscribe({
      next: (response) => {
        this.calculatorResult.set(response);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        displayApiError(err);
        this.isSubmitting.set(false);
      },
    });
  }

  protected clearForm() {
    this.calculatorForm.reset();
    this.calculatorResult.set(null);
  }
}
