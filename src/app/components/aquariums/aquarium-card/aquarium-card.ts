import { Component, computed, inject, input, output } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { DatePipe } from '@angular/common';
import { AquariumListItem } from '../../../core/models/aquarium.model';
import { RouterLink } from '@angular/router';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideEllipsisVertical,
  lucideNotebookPen,
  lucideNotebookText,
  lucideTrash2,
} from '@ng-icons/lucide';
import { AquariumService } from '../../../core/services/aquarium/aquarium.service';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { DeleteConfirmDialog } from '../../common/delete-confirm-dialog/delete-confirm-dialog';
import { displayApiError } from '../../../core/helpers/error-handler';
import { toast } from '@spartan-ng/brain/sonner';

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
  ],
  templateUrl: './aquarium-card.html',
  styleUrl: './aquarium-card.css',
  providers: provideIcons({
    lucideEllipsisVertical,
    lucideNotebookText,
    lucideNotebookPen,
    lucideTrash2,
  }),
})
export class AquariumCard {
  private readonly aquariumService = inject(AquariumService);
  readonly aquarium = input.required<AquariumListItem>();
  readonly editAquarium = output<string>();
  readonly refreshList = output<void>();
  protected readonly detailsLink = computed(() => `details/${this.aquarium().id}`);

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
