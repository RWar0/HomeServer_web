import { Component, inject, resource, signal } from '@angular/core';
import { AquariumCard } from '../../../components/aquariums/aquarium-card/aquarium-card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideRefreshCcw } from '@ng-icons/lucide';
import { firstValueFrom } from 'rxjs';
import { AquariumService } from '../../../core/services/aquarium/aquarium.service';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { AquariumCreateDialog } from '../../../components/aquariums/aquarium-create-dialog/aquarium-create-dialog';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';

@Component({
  selector: 'app-aquarium-list-page',
  imports: [
    AquariumCard,
    HlmButtonImports,
    HlmTooltipImports,
    NgIcon,
    AquariumCreateDialog,
    HasRoleDirective,
  ],
  templateUrl: './aquarium-list-page.html',
  styleUrl: './aquarium-list-page.css',
  viewProviders: [
    provideIcons({
      lucideRefreshCcw,
      lucidePlus,
    }),
  ],
})
export class AquariumListPage {
  private readonly aquariumService = inject(AquariumService);

  private readonly reload = signal(0);

  protected readonly aquariums = resource({
    params: () => this.reload(),
    loader: () => firstValueFrom(this.aquariumService.getAquariums()),
    defaultValue: [],
  });

  protected refreshAquariums(): void {
    this.reload.update((item) => item + 1);
  }
}
