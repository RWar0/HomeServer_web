import { Component, input } from '@angular/core';
import { DashboardRecentActivity } from '../../../core/models/dashboard.model';
import { NgIcon } from '@ng-icons/core';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { DashboardRecentActivityCard } from '../dashboard-recent-activity-card/dashboard-recent-activity-card';

@Component({
  selector: 'dashboard-recent-activities',
  imports: [NgIcon, HlmSpinner, DashboardRecentActivityCard],
  templateUrl: './dashboard-recent-activities.html',
  styleUrl: './dashboard-recent-activities.css',
})
export class DashboardRecentActivities {
  // Inputs
  public readonly activities = input.required<DashboardRecentActivity[] | null>();
  readonly isLoading = input.required<boolean>();
}
