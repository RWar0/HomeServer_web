import { Component, inject, input, signal, viewChild } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { AquariumService } from '../../../core/services/aquarium/aquarium.service';
import { displayApiError } from '../../../core/helpers/error-handler';
import { finalize } from 'rxjs';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { FileImportDragdrop } from '../../common/file-import-dragdrop/file-import-dragdrop';
import { SubmitButton } from '../../common/submit-button/submit-button';

@Component({
  selector: 'aquarium-upload-photo-dialog',
  imports: [
    HlmDialogImports,
    HlmButtonImports,
    HlmTooltipImports,
    FileImportDragdrop,
    SubmitButton,
  ],
  templateUrl: './aquarium-upload-photo-dialog.html',
  styleUrl: './aquarium-upload-photo-dialog.css',
})
export class AquariumUploadPhotoDialog {
  private readonly aquariumService = inject(AquariumService);

  readonly dialog = viewChild.required(HlmDialog);
  readonly aquariumId = input.required<string>();
  readonly aquariumName = input.required<string>();

  protected readonly isSubmitting = signal(false);
  protected readonly selectedPhoto = signal<File | null>(null);

  openDialog(): void {
    this.dialog().open();
  }

  protected closeDialog(): void {
    this.dialog().close();
  }

  protected uploadPhoto(): void {
    if (!this.selectedPhoto()) {
      toast.error('Nie wybrano zdjęcia', { description: 'Wybierz zdjęcie przed dodaniem!' });
      return;
    }
    if (!this.selectedPhoto()?.type.startsWith('image/')) {
      toast.error('Niepoprawny typ pliku', {
        description: 'Przesyłaj tylko zdjęcia (jpg, jpeg, png)',
      });
      return;
    }

    this.isSubmitting.set(true);
    this.aquariumService
      .uploadPhoto(this.aquariumId(), this.selectedPhoto()!)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          toast.success('Zdjęcie dodane pomyślnie');
        },
        error: (err) => {
          displayApiError(err);
        },
      });
  }
}
