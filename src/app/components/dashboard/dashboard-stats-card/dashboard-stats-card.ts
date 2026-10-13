import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { RouterLink } from '@angular/router';
import { HlmSpinner } from '@spartan-ng/helm/spinner';

type DashboardCardColor = 'blue' | 'red' | 'purple' | 'green';

@Component({
  selector: 'dashboard-stats-card',
  imports: [NgIcon, RouterLink, HlmSpinner],
  templateUrl: './dashboard-stats-card.html',
  styleUrl: './dashboard-stats-card.css',
})
export class DashboardStatsCard {
  // Inputs
  public readonly label = input.required<string>();
  public readonly value = input.required<number | string | null>();
  public readonly description = input.required<string | null>();
  public readonly icon = input.required<string>();
  public readonly isLoading = input.required<boolean>();

  public readonly color = input<DashboardCardColor>('blue');

  public readonly route = input<string | null>(null);
  public readonly queryParam = input<Record<string, string> | null>(null);

  protected getColorClass(): string {
    const colors: Record<DashboardCardColor, string> = {
      blue: 'text-blue-500',
      red: 'text-red-500',
      purple: 'text-purple-500',
      green: 'text-green-500',
    };

    return colors[this.color()];
  }

  protected getBgColorClass(): string {
    const colors: Record<DashboardCardColor, string> = {
      blue: 'bg-blue-500/10',
      red: 'bg-red-500/10',
      purple: 'bg-purple-500/10',
      green: 'bg-green-500/10',
    };

    return colors[this.color()];
  }

  protected getBorderColorClass(): string {
    const colors: Record<DashboardCardColor, string> = {
      blue: 'border-blue-500/15',
      red: 'border-red-500/15',
      purple: 'border-purple-500/15',
      green: 'border-green-500/15',
    };

    return colors[this.color()];
  }
}
