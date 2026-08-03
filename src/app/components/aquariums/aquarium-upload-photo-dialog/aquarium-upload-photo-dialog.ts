import { Component, inject, input, signal, viewChild } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogImports } from '@spartan-ng/helm/dialog';
import { AquariumService } from '../../../core/services/aquarium/aquarium.service';
import { displayApiError } from '../../../core/helpers/error-handler';
import { finalize } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUpload, lucideX } from '@ng-icons/lucide';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';

@Component({
  selector: 'aquarium-upload-photo-dialog',
  imports: [HlmDialogImports, HlmButtonImports, HlmTooltipImports, NgIcon],
  templateUrl: './aquarium-upload-photo-dialog.html',
  styleUrl: './aquarium-upload-photo-dialog.css',
  providers: [provideIcons({ lucideUpload, lucideX })],
})
export class AquariumUploadPhotoDialog {
  private readonly aquariumService = inject(AquariumService);

  readonly dialog = viewChild.required(HlmDialog);
  readonly aquariumId = input.required<string>();
  readonly aquariumName = input.required<string>();

  protected readonly isDragging = signal(false);
  protected readonly isUploading = signal(false);
  protected readonly selectedPhoto = signal<File | null>(null);
  protected readonly photoPreview = signal<string | null>(null);

  openDialog(): void {
    this.dialog().open();
  }

  protected closeDialog(): void {
    this.dialog().close();
  }

  protected onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  protected onDragLeave() {
    this.isDragging.set(false);
  }

  protected onDrop(event: DragEvent) {
    event.preventDefault();

    this.isDragging.set(false);

    const files = event.dataTransfer?.files;

    if (!files || files.length === 0) {
      return;
    }

    this.setFile(files[0]);
  }

  protected onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.setFile(input.files[0]);
    }
  }

  protected uploadPhoto(): void {
    if (!this.selectedPhoto()) {
      toast.error('Nie wybrano zdjęcia', { description: 'Wybierz zdjęcie przed dodaniem!' });
      return;
    }

    this.isUploading.set(true);
    this.aquariumService
      .uploadPhoto(this.aquariumId(), this.selectedPhoto()!)
      .pipe(
        finalize(() => {
          this.isUploading.set(false);
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

  protected removePhoto(): void {
    this.selectedPhoto.set(null);
    this.photoPreview.set(null);
  }

  private setFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Niepoprawny format', { description: 'Można wybrać tylko zdjęcie!' });
      return;
    }

    this.selectedPhoto.set(file);
    this.generatePreview(file);
  }

  private generatePreview(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }
}
