import { Component, inject, input, output, signal, resource } from '@angular/core';
import { AquariumPhotoDto, AquariumPhotoWithMetadata } from '../../../core/models/aquarium.model';
import { LabeledField } from '../../common/labeled-field/labeled-field';
import { DatePipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDownload, lucideEye, lucideTrash2 } from '@ng-icons/lucide';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';
import { RolesEnum } from '../../../core/enums/roles.enum';
import { Router } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { DeleteConfirmDialog } from '../../common/delete-confirm-dialog/delete-confirm-dialog';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { FilesService } from '../../../core/services/files/files.service';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { displayApiError } from '../../../core/helpers/error-handler';

@Component({
  selector: 'aquarium-details-photo-card',
  imports: [
    LabeledField,
    DatePipe,
    NgIcon,
    HlmTooltipImports,
    HlmDropdownMenuImports,
    HlmButtonImports,
    HasRoleDirective,
    DeleteConfirmDialog,
    HlmSpinnerImports,
  ],
  templateUrl: './aquarium-details-photo-card.html',
  styleUrl: './aquarium-details-photo-card.css',
  providers: [provideIcons({ lucideEye, lucideTrash2, lucideDownload }), DatePipe],
})
export class AquariumDetailsPhotoCard {
  private readonly router = inject(Router);
  private readonly datePipe = inject(DatePipe);
  private readonly filesService = inject(FilesService);

  readonly photoData = input.required<AquariumPhotoDto & { imageUrl?: string | null }>();

  readonly deletePhoto = output<string>();

  protected readonly isImageLoading = signal(true);

  protected readonly imageBlobResource = resource({
    params: () => this.photoData(),
    loader: ({ params }) => {
      this.isImageLoading.set(true);

      if ('imageUrl' in params && params.imageUrl) {
        return Promise.resolve(params.imageUrl);
      }

      return firstValueFrom(
        this.filesService.getImageById(params.id).pipe(
          map((blob) => URL.createObjectURL(blob)),
          catchError((err) => {
            displayApiError(err);
            return of(null);
          }),
        ),
      );
    },
  });

  protected readonly RolesEnum = RolesEnum;

  protected redirectToView() {
    this.router.navigate(['photo', this.photoData().id, { previousUrl: this.router.url }]);
  }

  protected deleteImage() {
    this.deletePhoto.emit(this.photoData().id);
  }

  protected downloadImage() {
    const currentUrl = this.imageBlobResource.value();
    if (!currentUrl) {
      toast.error('Zdjęcie nie jest dostępne do pobrania.');
      return;
    }

    const dateStamp = this.datePipe.transform(new Date(), 'HHmmssSSSS_ddMMyyyy');
    const formattedName = this.photoData()
      .originalName.replaceAll(' ', '_')
      .replaceAll('/', '_')
      .replaceAll('\\', '_');

    const fileName = `${dateStamp}_${formattedName}`;

    const link = document.createElement('a');
    link.href = currentUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
