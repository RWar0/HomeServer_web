import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideRotateCw } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';

@Component({
  selector: 'refresh-list-button',
  imports: [HlmButtonImports, HlmSpinnerImports, HlmTooltipImports, NgIcon],
  templateUrl: './refresh-list-button.html',
  styleUrl: './refresh-list-button.css',
  providers: [provideIcons({ lucideRotateCw })],
})
export class RefreshListButton {
  readonly isRefreshing = input.required<boolean>();

  readonly onRefresh = output<void>();
}
