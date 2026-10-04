import { Component, input } from '@angular/core';
import { translateEventCategory } from '../../../core/helpers/calendar-event-category-translator';
import { DashboardRecentActivity } from '../../../core/models/dashboard.model';
import {
  getEventCategoryIcon,
  getEventCategoryIconColorClass,
} from '../../../core/helpers/category-event-icon';
import { CalendarEventCategory } from '../../../core/enums/calendar-event-category.enum';
import { getDayDifference } from '../../../core/helpers/date-utils';
import { NgIcon } from '@ng-icons/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'dashboard-recent-activity-card',
  imports: [NgIcon, RouterLink],
  templateUrl: './dashboard-recent-activity-card.html',
  styleUrl: './dashboard-recent-activity-card.css',
})
export class DashboardRecentActivityCard {
  // Inputs
  public readonly activity = input.required<DashboardRecentActivity>();

  // Helpers
  protected translateEventCategory = translateEventCategory;

  protected getIconForCategory(item: DashboardRecentActivity): string {
    return getEventCategoryIcon(item.category);
  }

  protected getEventCategoryIconColorClass(category: CalendarEventCategory): string {
    return getEventCategoryIconColorClass(category);
  }

  protected getDateLabel(date: Date): string {
    const today = new Date();

    const daysDiff = Math.abs(getDayDifference(date, today));

    switch (daysDiff) {
      case 0:
        return 'Dziś';
      case 1:
        return 'Wczoraj';
      default:
        return `${daysDiff} dni temu`;
    }
  }
}
