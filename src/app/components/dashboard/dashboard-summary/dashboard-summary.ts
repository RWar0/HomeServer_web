import { Component, input } from '@angular/core';
import { DashboardStatsCard } from '../dashboard-stats-card/dashboard-stats-card';
import { DashboardSummaryData } from '../../../core/models/dashboard.model';

@Component({
  selector: 'dashboard-summary',
  imports: [DashboardStatsCard],
  templateUrl: './dashboard-summary.html',
  styleUrl: './dashboard-summary.css',
})
export class DashboardSummary {
  public readonly summaryData = input.required<DashboardSummaryData | null>();
  public readonly isLoading = input.required<boolean>();

  // Helpers
  protected getQueryParamToNextEvent(): Record<string, string> | null {
    const date = this.getDateToNextEvent();

    if (!date) {
      return null;
    }

    return { open_date: date };
  }

  private getDateToNextEvent(): string | undefined {
    const data = this.summaryData();
    if (!data) {
      return undefined;
    }

    if (!data.remainingDaysToNextEvent) {
      return undefined;
    }

    const dayDiff = data.remainingDaysToNextEvent;

    // Calculate the date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dayDiff);

    return targetDate.toISOString().split('T')[0];
  }
}
