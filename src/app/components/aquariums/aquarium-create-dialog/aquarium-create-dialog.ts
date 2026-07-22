import { Component, inject, output, signal, viewChild } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AquariumService } from '../../../core/services/aquarium/aquarium.service';
import { ErrorLabel } from '../../common/error-label/error-label';
import { CreateAquariumDto } from '../../../core/models/aquarium.model';
import { displayApiError } from '../../../core/helpers/error-handler';
import { toast } from '@spartan-ng/brain/sonner';
import { finalize } from 'rxjs';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

@Component({
  selector: 'aquarium-create-dialog',
  imports: [
    HlmDialogImports,
    HlmFieldImports,
    HlmInputImports,
    HlmButtonImports,
    NgIcon,
    HlmTooltipImports,
    ErrorLabel,
    ReactiveFormsModule,
    HlmSpinnerImports,
  ],
  templateUrl: './aquarium-create-dialog.html',
  styleUrl: './aquarium-create-dialog.css',
  viewProviders: [
    provideIcons({
      lucidePlus,
    }),
  ],
})
export class AquariumCreateDialog {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly aquariumService = inject(AquariumService);
  private readonly dialog = viewChild(HlmDialog);
  public readonly refreshList = output<void>();
  protected readonly isSubmitting = signal(false);

  protected readonly createAquariumForm = this.fb.group({
    name: ['', Validators.required],
    volume: [null, [Validators.required, Validators.min(1), Validators.max(100000)]],
    creationDate: ['', Validators.required],
  });

  protected createAquarium(): void {
    if (this.createAquariumForm.invalid) {
      this.createAquariumForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formData = this.createAquariumForm.getRawValue();
    const aquariumData: CreateAquariumDto = {
      name: formData.name,
      volume: formData.volume!,
      creationDate: formData.creationDate,
    };

    this.aquariumService
      .createAquarium(aquariumData)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          // Clear form
          this.createAquariumForm.reset();
          this.createAquariumForm.markAsUntouched();

          // Refresh list
          this.refreshList.emit();

          // Display message
          toast.success(res.message);

          // Close dialog
          this.dialog()?.close();
        },
        error: (error) => {
          displayApiError(error);
        },
      });
  }
}
