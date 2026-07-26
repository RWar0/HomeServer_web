import { Component, computed, input, output } from '@angular/core';
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
  readonly aquarium = input.required<AquariumListItem>();
  readonly editAquarium = output<string>();
  protected readonly detailsLink = computed(() => `details/${this.aquarium().id}`);

  protected openEditAquariumDialog(): void {
    this.editAquarium.emit(this.aquarium().id);
  }
}
