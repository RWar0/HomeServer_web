import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { DatePipe } from '@angular/common';
import { AquariumListItem } from '../../../core/models/aquarium.model';
import { RouterLink } from '@angular/router';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideEllipsisVertical,
  lucideImagePlus,
  lucideNotebookPen,
  lucideNotebookText,
  lucideTrash2,
} from '@ng-icons/lucide';
import { AquariumService } from '../../../core/services/aquarium/aquarium.service';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { DeleteConfirmDialog } from '../../common/delete-confirm-dialog/delete-confirm-dialog';
import { displayApiError } from '../../../core/helpers/error-handler';
import { toast } from '@spartan-ng/brain/sonner';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';
import { RolesEnum } from '../../../core/enums/roles.enum';
import { AquariumUploadPhotoDialog } from '../aquarium-upload-photo-dialog/aquarium-upload-photo-dialog';
import { FilesService } from '../../../core/services/files/files.service';
import { LabeledField } from '../../common/labeled-field/labeled-field';

@Component({
  selector: 'aquarium-card',
  imports: [
    HlmCardImports,
    HlmButtonImports,
    HlmSeparatorImports,
    HlmDropdownMenuImports,
    DatePipe,
    RouterLink,
    NgIcon,
    HlmAlertDialogImports,
    DeleteConfirmDialog,
    HasRoleDirective,
    AquariumUploadPhotoDialog,
    LabeledField,
    HlmSpinnerImports,
  ],
  templateUrl: './aquarium-card.html',
  styleUrl: './aquarium-card.css',
  providers: provideIcons({
    lucideEllipsisVertical,
    lucideNotebookText,
    lucideNotebookPen,
    lucideTrash2,
    lucideImagePlus,
  }),
})
export class AquariumCard {
  private readonly aquariumService = inject(AquariumService);
  private readonly filesService = inject(FilesService);

  readonly aquarium = input.required<AquariumListItem>();

  readonly editAquarium = output<string>();
  readonly refreshList = output<void>();

  protected readonly imagePreview = signal<string | null>(null);
  protected readonly isImageLoading = signal(true);

  protected readonly detailsLink = computed(() => `details/${this.aquarium().id}`);
  protected RolesEnum = RolesEnum;

  constructor() {
    effect(() => {
      const photoId = this.aquarium().lastPhotoId;
      if (photoId) {
        this.imagePreview.set(null);
        this.isImageLoading.set(true);
        this.filesService.getImageById(photoId).subscribe({
          next: (blob) => {
            this.imagePreview.set(URL.createObjectURL(blob));
          },
          error: (err) => {
            this.imagePreview.set('');
            displayApiError(err);
          },
        });
      }
    });
  }

  protected openEditAquariumDialog(): void {
    this.editAquarium.emit(this.aquarium().id);
  }

  protected deleteAquarium(): void {
    this.aquariumService.deleteAquarium(this.aquarium().id).subscribe({
      next: (res) => {
        this.refreshList.emit();
        toast.success(res.message);
      },
      error: (err) => {
        displayApiError(err);
      },
    });
  }
}
