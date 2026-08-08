import { Component, inject, input, output } from '@angular/core';
import { AquariumPhotoWithMetadata } from '../../../core/models/aquarium.model';
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
  ],
  templateUrl: './aquarium-details-photo-card.html',
  styleUrl: './aquarium-details-photo-card.css',
  providers: [provideIcons({ lucideEye, lucideTrash2, lucideDownload }), DatePipe],
})
export class AquariumDetailsPhotoCard {
  private readonly router = inject(Router);
  private readonly datePipe = inject(DatePipe);

  readonly photoData = input.required<AquariumPhotoWithMetadata>();

  readonly deletePhoto = output<string>();

  protected readonly RolesEnum = RolesEnum;

  protected redirectToView() {
    this.router.navigate(['photo', this.photoData().id]);
  }

  protected deleteImage() {
    this.deletePhoto.emit(this.photoData().id);
  }

  protected downloadImage() {
    if (!this.photoData().imageUrl) {
      toast.error('Zdjęcie nie jest dostępne do pobrania.');
      return;
    }

    const dateStamp = this.datePipe.transform(this.photoData().createdAt, 'HHmmssSSSS_ddMMyyyy');
    const formattedName = this.photoData()
      .originalName.replaceAll(' ', '_')
      .replaceAll('/', '_')
      .replaceAll('\\', '_');

    const fileName = `${dateStamp}_${formattedName}`;

    const link = document.createElement('a');
    link.href = this.photoData().imageUrl!;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
