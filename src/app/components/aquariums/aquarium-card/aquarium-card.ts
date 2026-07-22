import { Component, computed, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { DatePipe } from '@angular/common';
import { AquariumListItem } from '../../../core/models/aquarium.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'aquarium-card',
  imports: [HlmCardImports, HlmButtonImports, HlmSeparatorImports, DatePipe, RouterLink],
  templateUrl: './aquarium-card.html',
  styleUrl: './aquarium-card.css',
})
export class AquariumCard {
  readonly aquarium = input.required<AquariumListItem>();

  protected readonly detailsLink = computed(() => `details/${this.aquarium().id}`);
}
