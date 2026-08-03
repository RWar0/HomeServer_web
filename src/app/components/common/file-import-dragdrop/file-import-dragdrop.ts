import { Component, computed, input, output, signal } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFilePlus2, lucideUpload } from '@ng-icons/lucide';

@Component({
  selector: 'file-import-dragdrop',
  imports: [HlmButtonImports, NgIcon],
  templateUrl: './file-import-dragdrop.html',
  styleUrl: './file-import-dragdrop.css',
  providers: [provideIcons({ lucideUpload, lucideFilePlus2 })],
})
export class FileImportDragdrop {
  readonly fileTypeName = input<string>('plik');
  readonly acceptFormats = input<string>('*/*');

  readonly selectedFile = output<File | null>();

  protected readonly fileValue = signal<File | null>(null);
  protected readonly fileSize = computed(() => {
    const file = this.fileValue();

    if (!file) {
      return '';
    }

    const sizeInKB = file.size / 1024;

    if (sizeInKB < 1024) {
      return `${sizeInKB.toFixed(2)} KB`;
    }

    const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
    return `${sizeInMB} MB`;
  });
  protected readonly photoPreview = signal<string | null>(null);

  protected readonly isDragging = signal(false);

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

  protected removeFile() {
    this.fileValue.set(null);
    this.selectedFile.emit(null);

    this.photoPreview.set(null);
  }

  private setFile(file: File) {
    this.fileValue.set(file);
    this.selectedFile.emit(file);

    if (file.type.startsWith('image/')) {
      this.generatePreview(file);
    }
  }

  private generatePreview(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }
}
