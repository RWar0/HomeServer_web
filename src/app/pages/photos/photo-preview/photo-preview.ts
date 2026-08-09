import { Component, effect, inject, input, signal } from '@angular/core';
import { FilesService } from '../../../core/services/files/files.service';
import { finalize } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideDownload } from '@ng-icons/lucide';
import { toast } from '@spartan-ng/brain/sonner';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-photo-preview',
  imports: [HlmSpinnerImports, HlmButtonImports, NgIcon],
  templateUrl: './photo-preview.html',
  styleUrl: './photo-preview.css',
  providers: [provideIcons({ lucideDownload, lucideArrowLeft }), DatePipe],
})
export class PhotoPreview {
  private readonly datePipe = inject(DatePipe);
  private readonly filesService = inject(FilesService);
  protected readonly photoId = input.required<string>();
  protected imagePreview = signal<string | null>(null);
  protected imageLoading = signal<boolean>(false);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected previousUrl = this.route.snapshot.paramMap.get('previousUrl');

  constructor() {
    effect(() => {
      this.imageLoading.set(true);
      this.filesService
        .getImageById(this.photoId())
        .pipe(
          finalize(() => {
            this.imageLoading.set(false);
          }),
        )
        .subscribe({
          next: (blob) => {
            this.imagePreview.set(URL.createObjectURL(blob));
          },
          error: (err) => {
            this.imagePreview.set(null);
            displayApiError(err);
          },
        });
    });
  }

  protected redirectToPrevious() {
    if (this.previousUrl) {
      this.router.navigateByUrl(this.previousUrl);
    } else {
      this.router.navigate(['/']);
    }
  }

  protected downloadImage() {
    if (!this.imagePreview) {
      toast.error('Zdjęcie nie jest dostępne do pobrania.');
      return;
    }

    const dateStamp = this.datePipe.transform(new Date(), 'HHmmssSSSS_ddMMyyyy');

    const fileName = `${dateStamp}_zdjecie_${this.photoId()}.png`;

    const link = document.createElement('a');
    link.href = this.imagePreview()!;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
