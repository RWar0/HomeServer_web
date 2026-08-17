import { Component, inject, resource, signal, viewChild } from '@angular/core';
import { AquariumCard } from '../../../components/aquariums/aquarium-card/aquarium-card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideRefreshCcw } from '@ng-icons/lucide';
import { firstValueFrom } from 'rxjs';
import { AquariumService } from '../../../core/services/aquarium/aquarium.service';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';
import { AquariumCreateEditDialog } from '../../../components/aquariums/aquarium-create-edit-dialog/aquarium-create-edit-dialog';
import { RolesEnum } from '../../../core/enums/roles.enum';
import { RefreshListButton } from "../../../components/common/refresh-list-button/refresh-list-button";

@Component({
  selector: 'app-aquarium-list-page',
  imports: [
    AquariumCard,
    HlmButtonImports,
    HlmTooltipImports,
    NgIcon,
    AquariumCreateEditDialog,
    HasRoleDirective,
    RefreshListButton
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

  protected readonly createEditDialog = viewChild.required(AquariumCreateEditDialog);
  protected readonly selectedAquariumId = signal<string | null>(null);
  private readonly reload = signal(0);

  protected RolesEnum = RolesEnum;

  protected readonly aquariums = resource({
    params: () => this.reload(),
    loader: () => firstValueFrom(this.aquariumService.getAquariums()),
    defaultValue: [],
  });

  protected refreshAquariums(): void {
    this.reload.update((item) => item + 1);
  }

  protected openCreateDialog(): void {
    this.selectedAquariumId.set(null);
    this.createEditDialog()?.dialog().open();
  }

  protected openEditDialog(id: string): void {
    this.selectedAquariumId.set(id);
    this.createEditDialog()?.dialog().open();
  }
}
