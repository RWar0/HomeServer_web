import { Component, effect, inject, input, resource, signal } from '@angular/core';
import { AquariumService } from '../../../core/services/aquarium/aquarium.service';
import { firstValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';
import { LabeledField } from '../../../components/common/labeled-field/labeled-field';
import { FilesService } from '../../../core/services/files/files.service';
import { displayApiError } from '../../../core/helpers/error-handler';

@Component({
  selector: 'app-aquarium-details-page',
  imports: [DatePipe, LabeledField],
  templateUrl: './aquarium-details-page.html',
  styleUrl: './aquarium-details-page.css',
})
export class AquariumDetailsPage {
  private readonly aquariumService = inject(AquariumService);
  private readonly filesService = inject(FilesService);

  readonly aquariumId = input.required<string>();

  protected readonly imagePreview = signal<string | null>(null);

  private readonly reload = signal(0);

  protected readonly aquarium = resource({
    params: () => this.reload(),
    loader: () => firstValueFrom(this.aquariumService.getAquariumDetails(this.aquariumId())),
  });

  constructor() {
    effect(() => {
      const photoId = this.aquarium.value()?.lastPhotoId;
      if (photoId) {
        this.filesService.getImageById(photoId).subscribe({
          next: (blob) => {
            this.imagePreview.set(URL.createObjectURL(blob));
          },
          error: (err) => {
            this.imagePreview.set(null);
            displayApiError(err);
          },
        });
      }
    });
  }
}
