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
}
