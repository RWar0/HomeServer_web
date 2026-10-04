import { Component, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AquariumService } from '../../../core/services/aquarium/aquarium.service';
import { ErrorLabel } from '../../common/error-label/error-label';
import { CreateEditAquariumDto } from '../../../core/models/aquarium.model';
import { displayApiError } from '../../../core/helpers/error-handler';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { MessageResponse } from '../../../core/models/message-response.model';
import { finalize } from 'rxjs';
import { SubmitButton } from '../../common/submit-button/submit-button';

@Component({
  selector: 'aquarium-create-edit-dialog',
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
  templateUrl: './aquarium-create-edit-dialog.html',
  styleUrl: './aquarium-create-edit-dialog.css',
})
export class AquariumCreateEditDialog {
  // Injects
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly aquariumService = inject(AquariumService);

  // I/O
  public readonly refreshList = output<void>();

  // Signals
  readonly dialog = viewChild.required(HlmDialog);
  readonly aquariumId = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly isLoadingData = signal(false);

  constructor() {
    effect(() => {
      if (!this.aquariumId()) {
        this.createAquariumForm.reset();
        this.createAquariumForm.markAsUntouched();
        return;
      }

      this.isLoadingData.set(true);
      this.aquariumService
        .getAquariumForEdit(this.aquariumId()!)
        .pipe(
          finalize(() => {
            this.isLoadingData.set(false);
          }),
        )
        .subscribe({
          next: (res) => {
            this.createAquariumForm.patchValue(res);
          },
          error: (err) => {
            displayApiError(err);
          },
        });
    });
  }

  protected readonly createAquariumForm = this.fb.group({
    name: ['', Validators.required],
    volume: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(100000)],
    ],
    creationDate: ['', Validators.required],
  });

  protected submitForm(): void {
    if (this.createAquariumForm.invalid) {
      this.createAquariumForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formData = this.createAquariumForm.getRawValue();
    const aquariumData: CreateEditAquariumDto = {
      name: formData.name,
      volume: formData.volume!,
      creationDate: formData.creationDate,
    };

    if (this.aquariumId()) {
      this.editAquarium(aquariumData);
    } else {
      this.createAquarium(aquariumData);
    }
  }

  private createAquarium(aquariumData: CreateEditAquariumDto): void {
    this.aquariumService
      .createAquarium(aquariumData)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          // Clear form
          this.createAquariumForm.reset();
          this.createAquariumForm.markAsUntouched();

          this.processSuccess(res);
        },
        error: (error) => {
          displayApiError(error);
        },
      });
  }

  private editAquarium(aquariumData: CreateEditAquariumDto): void {
    this.aquariumService
      .updateAquarium(this.aquariumId()!, aquariumData)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          this.processSuccess(res);
        },
        error: (error) => {
          displayApiError(error);
        },
      });
  }

  private processSuccess(res: MessageResponse): void {
    // Refresh list
    this.refreshList.emit();

    // Display message
    toast.success(res.message);

    // Close dialog
    this.dialog()?.close();
  }

  // Open - Create / Edit
  openCreate() {
    this.open(null);
  }

  openEdit(aquariumId: string) {
    this.open(aquariumId);
  }

  private open(aquariumId: string | null) {
    this.createAquariumForm.reset();
    this.createAquariumForm.markAsUntouched();

    this.aquariumId.set(null);
    this.aquariumId.set(aquariumId);
    this.dialog().open();
  }
}
