import { Component, computed, inject, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { DashboardUpcomingEvent } from '../../../core/models/dashboard.model';
import { CalendarEventCategory } from '../../../core/enums/calendar-event-category.enum';
import { DatePipe } from '@angular/common';
import {
  getEventCategoryIcon,
  getEventCategoryIconColorClass,
} from '../../../core/helpers/category-event-icon';
import { translateEventCategory } from '../../../core/helpers/calendar-event-category-translator';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSpinner } from '@spartan-ng/helm/spinner';

export interface GroupedDashboardUpcomingEvents {
  dateKey: string;
  dayName: string;
  events: DashboardUpcomingEvent[];
}

@Component({
  selector: 'dashboard-upcoming-events',
  imports: [NgIcon, RouterLink, HlmButton, HlmSpinner],
  templateUrl: './dashboard-upcoming-events.html',
  styleUrl: './dashboard-upcoming-events.css',
  providers: [DatePipe],
})
export class DashboardUpcomingEvents {
  // Injects
  private readonly datePipe = inject(DatePipe);

  // Inputs
  readonly events = input.required<DashboardUpcomingEvent[] | null>();
  readonly isLoading = input.required<boolean>();

  // Computed
  protected readonly groupedEvents = computed<GroupedDashboardUpcomingEvents[] | null>(() => {
    if (!this.events()) {
      return null;
    }

    const groupsMap = new Map<string, { dateObj: Date; events: DashboardUpcomingEvent[] }>();

    for (const event of this.events()!) {
      const dateObj = new Date(event.date);

      const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;

      if (!groupsMap.has(dateKey)) {
        groupsMap.set(dateKey, { dateObj, events: [] });
      }
      groupsMap.get(dateKey)!.events.push(event);
    }

    return Array.from(groupsMap.entries()).map(([dateKey, group]) => ({
      dateKey,
      dayName: this.getDayName(group.dateObj),
      events: group.events,
    }));
  });

  protected isTomorrow(date: Date): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      date.getDay() === tomorrow.getDay() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    );
  }

  protected getDayName(date: Date): string {
    if (this.isTomorrow(date)) {
      return 'Jutro, ' + (this.datePipe.transform(date, 'd MMMM yyyy') ?? '');
    } else {
      return this.datePipe.transform(date, 'EEEE, d MMMM yyyy') ?? '';
    }
  }

  protected translateEventCategory = translateEventCategory;

  protected getIconForCategory(item: DashboardUpcomingEvent): string {
    return getEventCategoryIcon(item.category);
  }

  protected getEventCategoryIconColorClass(category: CalendarEventCategory): string {
    return getEventCategoryIconColorClass(category);
  }
}
